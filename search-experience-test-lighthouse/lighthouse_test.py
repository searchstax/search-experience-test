import asyncio
import base64
import json
from io import BytesIO
import os
import psycopg2
import subprocess

from lighthouse import LighthouseRunner

from PIL import Image
import matplotlib
matplotlib.use('agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle
from dotenv import dotenv_values
from json.decoder import JSONDecodeError

def get_db_conn():
    return psycopg2.connect(
        dbname=os.getenv("POSTGRES_DB"),
        user=os.getenv("POSTGRES_USER"),
        password=os.getenv("POSTGRES_PASSWORD"),
        host=os.getenv("POSTGRES_HOST")
    )

class lighthouseTester:
    def __init__(self, startURL, test_id):
        self.stage = 0
        self.status = -1
        self.startURL = startURL
        self.test_id = test_id
        self.error = ''
        self.pageSpeed = {'error':''}
        self.score = {}

    def save_test(self):

        database = get_db_conn()
        c = database.cursor()
        c.execute("UPDATE lighthouse SET status = %s, lighthouse_data = %s, score = %s WHERE id = %s",
            (2, json.dumps(self.pageSpeed), json.dumps(self.score), self.test_id, )
        )
        database.commit()
        c.close()

    async def checkLighthouse(self):
        conn = get_db_conn()
        c = conn.cursor()
        c.execute("INSERT INTO lighthouse (id, name, requestURL, status, lighthouse_data, score) VALUES (%s, %s, %s, %s ,%s, %s)",
            (self.test_id, self.startURL, self.startURL, 1, json.dumps({}), json.dumps({}))
        )
        conn.commit()
        c.close()
        conn.close()
        try:

            loadMetrics = [
                'first-contentful-paint',
                'speed-index',
                'interactive',
            ]

            settings = [
                '--chrome-flags=--no-sandbox --headless --disable-gpu --disable-dev-shm-usage',
                '--onlyCategories=accessibility,performance,seo'
            ]

            lighthouse = LighthouseRunner(self.startURL, form_factor = 'desktop', quiet = False, additional_settings = settings, timings = loadMetrics)
            self.pageSpeed = lighthouse.report.score
            self.score = lighthouse.report.score
        except Exception as error:
            print('Lighthouse Error:', error)
            self.pageSpeed['error'] = 'Could not check'
        
        self.save_test()
