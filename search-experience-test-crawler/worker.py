import asyncio
import redis
import json
import os
import time

#from search_test import searchTester
from crawl_test import crawlerManager

r = redis.Redis(host=os.getenv("REDIS_HOST", "localhost"), port=6379, db=0)

async def run_test(test_id, url):
    print('Crawling Site')
    c = crawlerManager(url, test_id)
    #await c.complete()

    return {
        'status': 'success',
    }, 200

def run_worker_test(test_id, url):
    # Entrypoint for the blocking loop
    result = asyncio.run(run_test(test_id, url))
    return result

def worker_loop():
    while True:
        _, task = r.brpop('crawl_queue')
        data = json.loads(task)
        run_worker_test(data['id'], data['url'])

if __name__ == '__main__':
    worker_loop()