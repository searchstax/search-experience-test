import asyncio
import redis
import json
import os
import time

from search_test import searchTester

r = redis.Redis(host=os.getenv("REDIS_HOST", "localhost"), port=6379, db=0)

async def run_test(test_id, url, terms):
    
    print('Finding search page')
    st = searchTester(url, test_id)
    await st.discoverSearchPage()
    await st.evaluateSearchFeatures()
    for term in terms.split(','):
        await st.evaluateSearchPage(term)
    await st.complete()

    return {
        'status': 'success',
    }, 200

def run_worker_test(test_id, url, terms):
    # Entrypoint for the blocking loop
    result = asyncio.run(run_test(test_id, url, terms))
    return result

def worker_loop():
    while True:
        _, task = r.brpop('test_queue')
        data = json.loads(task)
        run_worker_test(data['id'], data['url'], data['terms'])

if __name__ == '__main__':
    worker_loop()