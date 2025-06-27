import asyncio
import base64
import json
from io import BytesIO
import math
import openai
import os
import psycopg2
import subprocess

from PIL import Image
import matplotlib
matplotlib.use('agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle
from dotenv import dotenv_values
from json.decoder import JSONDecodeError
from playwright.async_api import async_playwright

def get_db_conn():
    return psycopg2.connect(
        dbname=os.getenv("POSTGRES_DB"),
        user=os.getenv("POSTGRES_USER"),
        password=os.getenv("POSTGRES_PASSWORD"),
        host=os.getenv("POSTGRES_HOST")
    )

class searchTester:
    def __init__(self, startURL, test_id):
        self.stage = 0
        self.status = -1
        self.startURL = startURL
        self.test_id = test_id
        self.searchURL = ''
        self.error = ''

        self.originalSource = ""
        self.modifiedSource = ""

        self.originalScreenshot = ""
        self.searchScreenshot = ""
        self.diffSource = ""
        self.sitesearch = {
            'coverage': 0,
            'height': 0,
            'width': 0,
        }
        self.schema = {}
        self.mainColors = []
        self.searchQuality = []
        self.searchFeatures = {
            'autocomplete': False,
            'googleAnalytics': False,
            'spellchecking': False
        }
        self.score = {}

    def save_test(self):
        data = {
            'stage': self.stage,
            'searchpage': {
                'startURL': self.startURL,
                'searchURL': self.searchURL,
                'searchQuality': self.searchQuality,
                'mainColors': self.mainColors,
                'sitesearch': self.sitesearch,
            },
            'screenshots': {
                'original': self.originalScreenshot,
                'search': self.searchScreenshot
            },
            'searchFeatures': self.searchFeatures,
            'searchQuality': self.searchQuality,
        }

        database = get_db_conn()
        c = database.cursor()
        score = {
            'autocomplete': 1 if self.searchFeatures['autocomplete'] else 0,
            'googleAnalytics': 1 if self.searchFeatures['googleAnalytics'] else 0,
            'spellchecking': 1 if self.searchFeatures['spellchecking'] else 0,
        }
        c.execute("UPDATE tests SET status = %s, test_data = %s, score = %s WHERE id = %s",
            (self.status, json.dumps(data), json.dumps(score), self.test_id, )
        )
        database.commit()
        c.close()

    async def complete(self):
        self.status = 2
        self.stage = 7
        self.save_test()

    async def discoverSearchPage(self):
        async with async_playwright() as p:
            self.status = 1
            self.stage = 1
            self.save_test()

            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(viewport={"width": 1400, "height": 900})
            page = await context.new_page()

            try:
                await page.goto(self.startURL)

                self.originalSource = await page.content()
                screenshot_bytes = await page.screenshot()
                self.originalScreenshot = base64.b64encode(screenshot_bytes).decode()

                search_input = await self.findSearchField(page)
                if not search_input:
                    print("No search field found")
                    await browser.close()
                    return

                bbox = await search_input.bounding_box()
                if not bbox:
                    print("Search input has no bounding box")
                    await browser.close()
                    return

                plt.imshow(Image.open(BytesIO(screenshot_bytes)))
                plt.gca().add_patch(Rectangle(
                    (bbox['x'], bbox['y']),
                    bbox['width'],
                    bbox['height'],
                    linewidth = 2,
                    edgecolor = 'r',
                    facecolor = 'none'
                ))
                buffer = BytesIO()
                plt.axis('off')
                plt.savefig(buffer, format = "JPEG", bbox_inches = 'tight', pad_inches = 0)
                self.originalScreenshot = base64.b64encode(buffer.getvalue()).decode()

                self.sitesearch['coverage'] = (bbox['width'] * bbox['height']) / (1400 * 900)
                self.sitesearch['height'] = round(bbox['height'])
                self.sitesearch['width'] = round(bbox['width'])

                await search_input.fill("testSearch")
                await search_input.press("Enter")
                await page.wait_for_load_state('networkidle')
                self.modifiedSource = await page.content()
                self.searchScreenshot = base64.b64encode(await page.screenshot()).decode()
                self.searchURL = page.url.replace("testSearch", "{*searchstring*}")
                print("Search URL:", self.searchURL)
                
                self.status = 1
                self.stage = 1
                self.save_test()

                await self.extractMainColors()
                await browser.close()
            except Exception as e:
                print('Timeout finding search', self.startURL, e)

    async def findSearchField(self, page):
        buttons = await page.query_selector_all("button")
        for btn in buttons:
            aria = await btn.get_attribute("aria-label")
            text = await btn.inner_text()
            if (aria and "search" in aria.lower()) or ("search" in text.lower()):
                try:
                    await btn.click()
                    break
                except:
                    continue

        inputs = await page.query_selector_all("input")
        for input_ in inputs:
            type_attr = await input_.get_attribute("type") or ""
            aria = await input_.get_attribute("aria-label") or ""
            placeholder = await input_.get_attribute("placeholder") or ""
            if (
                type_attr == "search"
                or "search" in aria.lower()
                or "search" in placeholder.lower()
            ):
                visible = await input_.is_visible()
                if visible:
                    return input_
        return None

    async def extractMainColors(self):

        def color_distance(c1, c2):
            return math.sqrt(sum((a - b) ** 2 for a, b in zip(c1, c2)))

        def is_valid_color(color):
            r, g, b = color
            brightness = (r + g + b) / 3
            return 30 < brightness < 225  # filter out near-black and near-white

        img = Image.open(BytesIO(base64.b64decode(self.searchScreenshot)))
        img.thumbnail((100, 100))
        palette_img = img.convert('P', palette=Image.ADAPTIVE, colors=16)
        color_counts = sorted(palette_img.getcolors(), reverse=True)
        palette = palette_img.getpalette()

        dominant_colors = []
        for count, color_index in color_counts:
            rgb = tuple(palette[color_index * 3: color_index * 3 + 3])
            if not is_valid_color(rgb):
                continue
            if all(color_distance(rgb, existing) > 40 for existing in dominant_colors):
                dominant_colors.append(rgb)
            if len(dominant_colors) >= 10:
                break

        self.mainColors = dominant_colors

    async def evaluateSearchPage(self, searchTerm):
        if self.searchURL != '':
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page()
                
                url = self.searchURL.replace("{*searchstring*}", searchTerm)
                
                await page.goto(url)
                
                self.searchScreenshot = base64.b64encode(await page.screenshot()).decode()
                
                body_text = await page.inner_text("body")
                await browser.close()
                
                response = self.checkRelevance(f"For a site visitor searching with this search query: '{searchTerm}' how relevant are these site search results? {body_text}")
                
                try:
                    data = json.loads(response, strict=False)
                    self.searchQuality.append({
                        'searchURL': url,
                        'query': searchTerm,
                        'quality': data,
                    })
                except JSONDecodeError as e:
                    print(response, e)
                
                self.save_test()

    async def evaluateSearchFeatures(self):
        if self.searchURL != '':
            async with async_playwright() as p:
                self.status = 1
                self.stage = 2
                self.save_test()
                
                autosuggestRequests = 0
                ga_detected = False

                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context(viewport={"width": 1400, "height": 900})
                page = await context.new_page()

                network_requests = []
                post_load_requests = []

                page.on("request", lambda request: network_requests.append({
                    'method': request.method,
                    'url': request.url,
                    'headers': request.headers
                }))

                try:
                    await page.goto(self.searchURL, wait_until="networkidle")

                    page.on("request", lambda request: post_load_requests.append({
                        'method': request.method,
                        'url': request.url,
                        'headers': request.headers
                    }))

                    search_input = await self.findSearchField(page)
                    if search_input:
                        for char in "apply":
                            await search_input.type(char)
                            await asyncio.sleep(0.5)

                    for request in post_load_requests:
                        if 'google-analytics' in request['url']:
                            self.searchFeatures['googleAnalytics'] = True
                        else:
                            autosuggestRequests += 1

                    self.searchFeatures['autocomplete'] = autosuggestRequests > 2

                    await page.goto(self.searchURL.replace('{*searchstring*}', 'applacation'), wait_until="networkidle")
                    bodyContent = await page.content()
                    self.searchFeatures['spellchecking'] = 'application' in bodyContent

                    await browser.close()

                except Exception as e:
                    print('Timeout finding fetures', self.searchURL, e)
                
                self.save_test()

    def checkRelevance(self, prompt):
        try:
            config = dotenv_values(".env")
            client = openai.OpenAI(api_key=config['OPENAI_KEY'])
            stream = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are evaluating the relevancy and quality of a website's site search result page. You need to determine if the search results are relevant for a given search query and how satisfied a site visitor might be with the results, rate the relevancy of the results from 1 to 10, and recommend any additional results or search features that would be helpful for the search keyword. Only return text strings for the relevance summary and list of recommendations and an integer for the relevancy score. Please return a valid JSON file that includes a 'relevance_summary' field, 'relevancy_score' field, and 'page_recommendations' field that includes a list of three recommendations."},
                    {"role": "user", "content": prompt},
                ],
                response_format={ "type": "json_object" },
            )
            return stream.choices[0].message.content
        except Exception as error:
            print('OpenAI Error:', error)
            return '{"relevance_summary": "","relevancy_score": "","page_recommendations": ""}'
