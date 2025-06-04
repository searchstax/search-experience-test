import json
import os
import redis
import psycopg2
import uuid

from datetime import datetime, timedelta, timezone
from dateutil import parser

from flask import Flask, request, g, render_template
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

app = Flask(__name__)
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",
)

r = redis.Redis(host=os.getenv("REDIS_HOST", "search-experience-test-redis"), port=6379, db=0)

def get_db_conn():
    return psycopg2.connect(
        dbname=os.getenv("POSTGRES_DB"),
        user=os.getenv("POSTGRES_USER"),
        password=os.getenv("POSTGRES_PASSWORD"),
        host=os.getenv("POSTGRES_HOST")
    )

@app.route('/')
@limiter.exempt
def index():
    return 'Search Experience Test', 200

@app.route('/request', methods=['POST'])
def request_test():
    req = request.json
    url = req.get('url')
    terms = req.get('terms')

    test_id = str(uuid.uuid4())
    test_request = {
        'id': test_id,
        'url': url,
        'terms': terms,
    }

    r.lpush('test_queue', json.dumps(test_request))
    r.lpush('lighthouse_queue', json.dumps(test_request))
    r.lpush('crawl_queue', json.dumps(test_request))
    
    data = {
        'stage': 0,
    }

    conn = get_db_conn()
    c = conn.cursor()
    c.execute("INSERT INTO tests (id, name, requestURL, status, test_data, score) VALUES (%s, %s, %s, %s ,%s, %s)",
        (test_id, url, url, 1, json.dumps(data), json.dumps({}))
    )
    conn.commit()
    c.close()
    conn.close()

    return {
        'status': 'success',
        'testID': test_id
    }, 200

@app.route('/check-test', methods=['POST'])
@limiter.exempt
def check_status():
    data = request.json
    test_id = data.get('testID')

    conn = get_db_conn()
    c = conn.cursor()
    c.execute("SELECT status FROM tests WHERE id=%s", (test_id,))
    test_result = c.fetchone()

    c.execute("SELECT status FROM lighthouse WHERE id = %s", (test_id,))
    lighthouse_result = c.fetchone()

    c.execute("SELECT status FROM crawls WHERE id = %s", (test_id,))
    crawl_result = c.fetchone()

    c.close()
    conn.close()
    if test_result:
        return {
            'status': 'success',
            'testID': test_id,
            'search': {
                'status': test_result[0] if test_result else -1,
            },
            'crawl': {
                'status': crawl_result[0] if crawl_result else -1,
            },
            'lighthouse': {
                'status': lighthouse_result[0] if lighthouse_result else -1,
            }
        }, 200
    else:
        return {
            'status': 'success',
            'testID': '-1'
        }, 200

@app.route('/load-test', methods=['POST'])
@limiter.exempt
def load_test():
    data = request.json
    test_id = data.get('testID')

    conn = get_db_conn()
    c = conn.cursor()
    c.execute("SELECT status, test_data, score FROM tests WHERE id = %s", (test_id,))
    test_result = c.fetchone()

    c.execute("SELECT status, lighthouse_data, score FROM lighthouse WHERE id = %s", (test_id,))
    lighthouse_result = c.fetchone()

    c.execute("SELECT status, crawl_data, score FROM crawls WHERE id = %s", (test_id,))
    crawl_result = c.fetchone()

    c.close()
    conn.close()
    if test_result:
        return {
            'status': 'success',
            'testID': test_id,
            'search': {
                'status': test_result[0] if test_result else -1,
                'data': json.loads(test_result[1]),
                'score': json.loads(test_result[2]),
            },
            'crawl': {
                'status': crawl_result[0] if crawl_result else -1,
                'data': json.loads(crawl_result[1] or {}),
                'score': json.loads(crawl_result[2] or {}),
            },
            'lighthouse': {
                'status': lighthouse_result[0] if lighthouse_result else -1,
                'data': json.loads(lighthouse_result[1] or {}),
                'score': json.loads(lighthouse_result[2] or {}),
            }
        }, 200
    else:
        return {
            'status': 'success',
            'testID': '-1'
        }, 200

@app.route('/test-history', methods=['POST'])
@limiter.exempt
def check_history():
    conn = get_db_conn()
    c = conn.cursor()

    c.execute("""
        SELECT 
            t.id AS test_id,
            t.requesturl,
            t.created,
            t.score AS test_score,
            l.score AS lighthouse_score,
            cwl.score AS crawl_score
        FROM tests t
        LEFT JOIN lighthouse l ON t.id = l.id
        LEFT JOIN crawls cwl ON t.id = cwl.id
        ORDER BY t.created DESC
    """)
    
    rows = c.fetchall()

    results = []
    for row in rows:
        results.append({
            "testID": row[0],
            "requestURL": row[1],
            "created": row[2],
            "testScore": row[3],
            "lighthouseScore": row[4],
            "crawlScore": row[5]
        })

    c.close()
    conn.close()

    return {
        "status": "success",
        "tests": results
    }, 200

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS')
    return response

if __name__ == "__main__":
    app.run()