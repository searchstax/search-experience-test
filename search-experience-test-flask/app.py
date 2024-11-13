import sqlite3
import json

from datetime import datetime, timedelta, timezone
from dateutil import parser

from flask import Flask, request, g, render_template
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from lighthouse import LighthouseRunner

from findsearch import searchFinder
from crawl import crawlerManager

app = Flask(__name__)
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",
)

@app.route('/')
@limiter.exempt
def index():
    return 'Good', 200

@app.route("/test-url", methods=['POST'])
@limiter.limit("10/minute")
def testURL():
    data = request.get_json(silent=True)
    
    pagespeed = {
        'error': ''
    }
    print('Finding search page')
    sf = searchFinder(data['url'])
    sf.discoverSearchPage()

    try:

        loadMetrics = [
            'first-contentful-paint',
            'speed-index',
            'interactive',
        ]

        settings = [
            '--chrome-flags=--no-sandbox --headless --disable-gpu',
            '--onlyCategories=accessibility,performance,seo'
        ]

        lighthouse = LighthouseRunner(data['url'], form_factor = 'desktop', quiet = False, additional_settings = settings, timings = loadMetrics)
        pagespeed['score'] = lighthouse.report.score
    except Exception as error:
        print('Lighthouse Error:', error)
        pagespeed['error'] = 'Could not check'

    return {
        'status': 'success',
        'data': {
            'searchpage': {
                'startURL': sf.startURL,
                'searchURL': sf.searchURL,
                'searchQuality': sf.searchQuality,
                'mainColors': sf.mainColors,
                'sitesearch': sf.sitesearch,
            },
            'pagespeed': pagespeed,
            'schema': sf.schema,
            'screenshots': {
                'original': sf.originalScreenshot,
                'search': sf.searchScreenshot
            }
        }
    }, 200

@app.route("/test-search", methods=['POST'])
@limiter.limit("10/minute")
def testSearch():
    data = request.get_json(silent=True)

    sf = searchFinder(data['url'])
    sf.searchURL = data['url']
    sf.evaluateSearchPage(data['searchTerm'])

    return {
        'status': 'success',
        'data': {
            'searchpage': {
                'startURL': sf.startURL,
                'searchURL': sf.searchURL,
                'searchQuality': sf.searchQuality,
                'mainColors': sf.mainColors,
            },
            'screenshots': {
                'original': sf.originalScreenshot,
                'search': sf.searchScreenshot
            }
        }
    }, 200

@app.route("/test-features", methods=['POST'])
@limiter.limit("10/minute")
def testFeatures():
    data = request.get_json(silent=True)

    sf = searchFinder(data['url'])
    sf.searchURL = data['url']
    sf.evaluateSearchFeatures()

    return {
        'status': 'success',
        'data': {
            'searchpage': {
                'startURL': sf.startURL,
                'searchURL': sf.searchURL,
                'searchQuality': sf.searchQuality,
                'mainColors': sf.mainColors,
                'searchFeatures': sf.searchFeatures,
            },
            'screenshots': {
                'original': sf.originalScreenshot,
                'search': sf.searchScreenshot
            },
        }
    }, 200

@app.route("/crawl-url", methods=['POST'])
@limiter.limit("10/minute")
def crawlURL():
    data = request.get_json(silent=True)
    print(data)
    
    c = crawlerManager(data['url'])

    return {
        'status': 'success',
        'data': {
            'crawlID': c.crawlID
        }
    }, 200

@app.route("/check-crawl", methods=['POST'])
@limiter.exempt
def checkCrawl():
    data = request.get_json(silent=True)
    print(data)
    
    cID = data['crawlID']
    
    database = get_db_connection()
    c = database.cursor()
    c.execute('SELECT * FROM crawls WHERE id = ?',
        (cID,)
    )
    row = c.fetchone()
    c.close()
    
    if row is not None:
        pageData = json.loads(row['page_data'])
        facets = []
        
        dateCounts = {}
        typeCounts = {}
        now = datetime.now(timezone.utc)
        for thisPage in pageData:
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
        return {
            'status': 'success',
            'data': {
                'crawlID': cID,
                'status': row['status'],
                'pageData': pageData,
                'facetData': facets
            }
        }, 200
    else:
        return {
            'status': 'failed',
            'data': {}
        }, 200

def get_db_connection():
        conn = sqlite3.connect('database.db')
        conn.row_factory = sqlite3.Row
        return conn

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS')
    return response

if __name__ == "__main__":
    app.run()