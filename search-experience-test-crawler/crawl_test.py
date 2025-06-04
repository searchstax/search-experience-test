import asyncio
import json
import re
import os
import psycopg2
import scrapy
from twisted.internet import asyncioreactor
asyncioreactor.install()
from crochet import wait_for

from datetime import datetime, timedelta, timezone
from dateutil import parser

from scrapy.crawler import CrawlerProcess, CrawlerRunner
from scrapy.spiders import Rule
from scrapy.utils.project import get_project_settings
from scrapy.utils.log import configure_logging
from scrapy.linkextractors import LinkExtractor
from scrapy.http.request import Request
from urllib.parse import urlparse
from crochet import setup
setup()

def get_db_connection():
    return psycopg2.connect(
        dbname=os.getenv("POSTGRES_DB"),
        user=os.getenv("POSTGRES_USER"),
        password=os.getenv("POSTGRES_PASSWORD"),
        host=os.getenv("POSTGRES_HOST")
    )

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
        self.pageData = []
        self.score = {}
        self.urlList = []
        
        self.loadFromDB()
    
    def loadFromDB(self):
        database = get_db_connection()
        c = database.cursor()
        c.execute("SELECT * FROM crawls WHERE id = %s",
            (self.crawlID,)
        )
        row = c.fetchone()
        
        if row is not None:
            self.requestURL = row[3]
            domain = '{uri.netloc}'.format(uri = urlparse(self.requestURL))
            self.allowed_domains = [domain]
            self.start_urls = [self.requestURL]
            self.urlList = [self.requestURL]
            c.execute('UPDATE crawls SET status = %s WHERE id = %s',
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
        
    def closed(self, reason):
        print('Done', reason)

        facets = []
        
        dateCounts = {}
        typeCounts = {}
        now = datetime.now(timezone.utc)
        for thisPage in self.pageData:
            if thisPage['modified'] != None:
                pageDate = parser.parse(thisPage['modified'])
                
                dateDiff = now - pageDate
                modified = 'Last Year'
                if dateDiff < timedelta(days = 30):
                    modified = 'This Week'
                if dateDiff < timedelta(days = 7):
                    modified = 'This Week'
                    
                if modified in dateCounts:
                    dateCounts[modified] += 1
                else:
                    dateCounts[modified] = 1
            if thisPage['type'] in typeCounts:
                typeCounts[thisPage['type']] += 1
            else:
                typeCounts[thisPage['type']] = 1
                
        dateFacets = [{'name': key.title() if key is not None else 'Other', 'count': dateCounts[key]} for key in dateCounts]
                
        typeFacets = [{'name': key.title() if key is not None else 'Other', 'count': typeCounts[key]} for key in typeCounts]
        typeFacets.append({'name': 'Downloads', 'count': 0})
            
        facets.append({
            'name': 'Content Type',
            'options': typeFacets
        })
        facets.append({
            'name': 'Last Updated',
            'options': dateFacets
        })

        data = {
            'facetData': facets,
            'pageData': self.pageData,
        }
        
        database = get_db_connection()
        c = database.cursor()
        self.score = {
            'facets': 1 if len(facets) > 0 else 0
        }
        c.execute('UPDATE crawls SET status = %s, crawl_data = %s, score = %s WHERE id = %s',
            (2, json.dumps(data), json.dumps(self.score), self.crawlID, )
        )
        database.commit()
        c.close()

class crawlerManager():
    def __init__(self, requestURL, crawlID):
        self.crawlID = crawlID
        self.requestURL = requestURL
        self.name = 'crawler'
        
        database = get_db_connection()
        c = database.cursor()
        c.execute('INSERT INTO crawls (id, name, requestURL, status, crawl_data, score) VALUES (%s, %s, %s, %s, %s, %s)',
            (self.crawlID, self.name, self.requestURL, -1, json.dumps([]), json.dumps({}))
        )
        database.commit()
        c.close()
        
        self.startCrawl()
        
    @wait_for(timeout=60*10)
    def startCrawl(self):
        print('New Crawl', self.requestURL)
        configure_logging()
        settings = get_project_settings()
        runner = CrawlerRunner(settings)
        runner.crawl(crawler, self.crawlID)
