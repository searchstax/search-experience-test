import json
import re
import scrapy
import sqlite3
from twisted.internet import reactor
from scrapy.crawler import CrawlerProcess, CrawlerRunner
from scrapy.spiders import Rule
from scrapy.utils.project import get_project_settings
from scrapy.utils.log import configure_logging
from scrapy.linkextractors import LinkExtractor
from scrapy.http.request import Request
from urllib.parse import urlparse
from crochet import setup
setup()

class crawler(scrapy.Spider):
    def __init__(self, crawlID):
        self.crawlID = crawlID
        self.name = 'crawler'
        self.requestURL = ''
        self.allowed_domains = []
        self.start_urls = []
        self.custom_settings = {
            "DEPTH_LIMIT": 2
        }
        self.crawledURLs = 0
        self.maxURLs = 50
        self.urlList = []
        self.pageData = []
        
        self.loadFromDB()
    
    def loadFromDB(self):
        database = self.get_db_connection()
        c = database.cursor()
        c.execute('SELECT * FROM crawls WHERE id = ?',
            (self.crawlID,)
        )
        row = c.fetchone()
        
        if row is not None:
            self.requestURL = row['requestURL']
            domain = '{uri.netloc}'.format(uri = urlparse(self.requestURL))
            self.allowed_domains = [domain]
            self.start_urls = [self.requestURL]
            self.urlList = [self.requestURL]
            c.execute('UPDATE crawls SET status = ? WHERE id = ?',
                (1, self.crawlID, )
            )
            database.commit()
        c.close()
        
    def parse(self, response):
        title = response.css("title::text").get()
        description = response.xpath('//meta[@name="description"]/@content').get()
        ogImage = response.xpath('//meta[@property="og:image"]/@content').get()
        ogType = response.xpath('//meta[@property="og:type"]/@content').get()
        articleModified = response.xpath('//meta[@property="article:modified_time"]/@content').get()
        dateModified = response.xpath('//meta[@property="date-modified"]/@content').get()
        body = response.xpath('//body//*[not(self::script) and not(self::style)]/text()').getall()
        body = ' '.join(body)
        body = re.sub(r'\s+', ' ', str(body))
        self.pageData.append({
            'url': response.url,
            'title': title,
            'description': description,
            'type': ogType,
            'modified': articleModified or dateModified,
            'image': ogImage,
            'text': body
        })
        self.crawledURLs += 1
        for link in response.css("a::attr(href)").getall():
            url = response.urljoin(link)
            if 'http' in url and self.crawledURLs < self.maxURLs:
                if url not in self.urlList and len(self.urlList) <= self.maxURLs:
                    print('Adding', url)
                    self.urlList.append(url)
                    yield Request(url, callback = self.parse)
    
    def get_db_connection(self):
        conn = sqlite3.connect('database.db')
        conn.row_factory = sqlite3.Row
        return conn
        
    def closed(self, reason):
        print('Done', reason)
        
        database = self.get_db_connection()
        c = database.cursor()
        c.execute('UPDATE crawls SET status = ?, page_data = ? WHERE id = ?',
            (2, json.dumps(self.pageData), self.crawlID, )
        )
        database.commit()
        c.close()

class crawlerManager():
    def __init__(self, requestURL):
        self.crawlID = -1
        self.requestURL = requestURL
        self.name = 'crawler'
        
        database = self.get_db_connection()
        c = database.cursor()
        c.execute('INSERT INTO crawls (name, requestURL, status, page_data) VALUES (?, ?, ?, ?)',
            (self.name, self.requestURL, -1, json.dumps([]))
        )
        database.commit()
        self.crawlID = c.lastrowid
        c.close()
        
        self.startCrawl()
        
    def startCrawl(self):
        print('New Crawl', self.requestURL)
        configure_logging()
        settings = get_project_settings()
        runner = CrawlerRunner(settings)
        runner.crawl(crawler, self.crawlID)
    
    def get_db_connection(self):
        conn = sqlite3.connect('database.db')
        conn.row_factory = sqlite3.Row
        return conn