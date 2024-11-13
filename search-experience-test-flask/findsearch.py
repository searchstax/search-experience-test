import json
import time

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.action_chains import ActionChains
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service

from difflib import SequenceMatcher

import matplotlib
matplotlib.use('agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle

from PIL import Image
from io import BytesIO
import base64

import openai
from json.decoder import JSONDecodeError
from dotenv import dotenv_values

class searchFinder():
	def __init__(self, startURL):
		self.startURL = startURL
		self.searchURL = ''
		self.searchField = False
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
		# Set up the Selenium Chrome instance
		chromeOptions = webdriver.ChromeOptions()
		chromeOptions.add_argument('--headless')
		chromeOptions.add_argument('--window-size=1420,1080')
		chromeOptions.add_argument('--verbose')
		chromeOptions.add_argument('--enable-logging')
		chromeOptions.add_argument('--log-level=0')
		chromeOptions.set_capability('goog:loggingPrefs', {'performance': 'ALL'})

		service = Service('/usr/bin/chromedriver')
		self.driver = webdriver.Chrome(service = service, options = chromeOptions)

	def discoverSearchPage(self):
		# Fetch the start URL and attempt to find a search bar
		# If a search field is found, fake a screenshot and outline the search bar
		self.driver.set_window_position(0, 0)
		self.driver.set_window_size(1400, 900)

		self.driver.get(self.startURL)
		self.driver.implicitly_wait(10)

		self.findSearchField()
		
		self.originalSource = self.driver.page_source
		self.originalScreenshot = self.driver.get_screenshot_as_base64()

		if self.searchField == False:
			print('No search field found')
		else:
			print('Starting URL', self.driver.current_url)

			try:
				self.searchField.click()
				# Outline the search box
				plt.imshow(Image.open(BytesIO(base64.b64decode(self.originalScreenshot))))
				plt.gca().add_patch(Rectangle(
					(
						self.searchField.location['x'],
						self.searchField.location['y']
					),
					self.searchField.size['width'],
					self.searchField.size['height'],
					linewidth = 2,
					edgecolor = 'r',
					facecolor = 'none'
				))
				buffered = BytesIO()
				plt.axis('off')
				plt.savefig(buffered, format="JPEG", bbox_inches='tight', pad_inches = 0)
				# Create screenshot of search page
				self.originalScreenshot = base64.b64encode(buffered.getvalue()).decode()
				self.sitesearch['coverage'] = (self.searchField.size['width'] * self.searchField.size['width']) / (1400 * 900)
				self.sitesearch['height'] = self.searchField.size['height']
				self.sitesearch['width'] = self.searchField.size['width']

				searchTerm = "testSearch"
				self.originalSource = self.driver.page_source
				self.searchField.clear()
				self.searchField.send_keys(searchTerm)
				try:
					self.searchField.submit()
				except Exception as e:
					print('not submittable', e)
					for button in self.driver.find_elements(By.XPATH, "//button"):
						if ((button.get_attribute('aria-label') != None
							and 'search' in button.get_attribute('aria-label').lower())
							or 'search' in button.text.lower()
						):
							print('Clicking search button', button.id)
							button.click()
							time.sleep(2)
							break
				
				WebDriverWait(self.driver, 10).until(EC.url_changes(self.startURL))

				self.modifiedSource = self.driver.page_source
				self.searchScreenshot = self.driver.get_screenshot_as_base64()
				self.searchURL = self.driver.current_url.replace('testSearch', '{*searchstring*}')
				print('Search URL', self.searchURL)

				# Find major website colors
				img = Image.open(BytesIO(base64.b64decode(self.searchScreenshot)))
				
				img.thumbnail((100, 100))

				palette = img.convert('P', palette = Image.ADAPTIVE, colors = 16)
				colors = palette.getpalette()
				color_counts = sorted(colors.getcolors(), reverse=True)
				dominant_colors = []
				for i in range(10):
					palette_index = color_counts[i][1]
					dominant_colors.append(palette[palette_index*3:palette_index*3+3])

				self.mainColors = dominant_colors
				
			except Exception as e:
				print('Could not fill search field', e)

		self.driver.quit()

	def evaluateSearchPage(self, searchTerm):
		# Use the OpenAI API to evaluate search result quality
		if self.searchURL != '':
			self.driver.get(self.searchURL.replace('{*searchstring*}', searchTerm))
			self.driver.implicitly_wait(10)
			self.searchScreenshot = self.driver.get_screenshot_as_base64()

			bodyContent = self.driver.find_element(By.XPATH, "/html/body").text

			openAiResponse = self.checkRelevance("For the search query '%s' how relevant are these results? %s" % (searchTerm, bodyContent))
			print(openAiResponse)
			try:
				data = json.loads(openAiResponse.content, strict = False)
				self.searchQuality.append({
					'query': searchTerm,
					'quality': data,
				})
			except JSONDecodeError as e:
				print(openAiResponse.content, e)

	def evaluateSearchFeatures(self):
		# Check search page for autosuggest, analytics, and spell checking
		if self.searchURL != '':
			self.driver.set_window_position(0, 0)
			self.driver.set_window_size(1400, 900)

			self.driver.get(self.searchURL)
			self.driver.implicitly_wait(10)
			
			self.findSearchField()

			if self.searchField == False:
				print('No search field found')
			else:
				time.sleep(5)
				autosuggestRequests = 0
				preAutocompleteLogs = self.driver.get_log("performance")
				preAutcompleteHTML = self.driver.execute_script("return document.documentElement.outerHTML")
				_ = self.driver.get_log('browser')
				self.searchField.clear()
				self.searchField.send_keys('a')
				time.sleep(0.5)
				self.searchField.send_keys('p')
				time.sleep(0.5)
				self.searchField.send_keys('p')
				time.sleep(0.5)
				self.searchField.send_keys('l')
				time.sleep(0.5)
				self.searchField.send_keys('y')
				postAutocompleteLogs = self.driver.get_log("performance")
				postAutcompleteHTML = self.driver.execute_script("return document.documentElement.outerHTML")
				for log in postAutocompleteLogs:
					request = json.loads(log['message'])
					if request['message']['method'] == 'Network.responseReceived':
						if 'google-analytics' in request['message']['params']['response']['url']:
							self.searchFeatures['googleAnalytics'] = True
						else:
							autosuggestRequests += 1
				self.searchFeatures['autocomplete'] = autosuggestRequests > 2
				print(autosuggestRequests)
				print(len(preAutocompleteLogs), len(postAutocompleteLogs))
				print(postAutcompleteHTML == preAutcompleteHTML)
				
				self.driver.get(self.searchURL.replace('{*searchstring*}', 'applacation'))

				time.sleep(10)
			
				bodyContent = self.driver.find_element(By.XPATH, "/html/body").text
				self.searchFeatures['spellchecking'] = 'application' in bodyContent

	def findSearchField(self):
		# Try to find the search bar and submit a search to capture search page URL
		self.searchField = False
		for button in self.driver.find_elements(By.XPATH, "//button"):
			if (button.get_attribute('aria-label') != None
				and 'search' in button.get_attribute('aria-label').lower()
			):
				button.click()
				break
		for item in self.driver.find_elements(By.XPATH, "//input"):
			print('Type:', item.get_attribute('type'))
			if (item.get_attribute('type') == 'search'
				or item.get_attribute('aria-label') == 'search'
				or 'search' in item.get_attribute('placeholder').lower()
			):
				self.searchField = item
				print('Displayed:', item.is_displayed(), 'Enabled:', item.is_enabled(), 'Placeholder:', item.get_attribute('placeholder'))
				if not self.searchField.is_displayed():
					try:
						WebDriverWait(self.driver, 10).until(EC.visibility_of_all_elements_located((By.XPATH, '//input')))
						self.searchField.click()
						self.searchField.clear()
						self.searchField.send_keys('testSearch')
						break
					except Exception as e:
						print('Failed waiting until visible', e)
						self.searchField = item
				else:
					break

	def findSchema(self):
		# Check for site search schema
		for item in self.driver.find_elements(By.TAG_NAME, "script"):
			if item.get_attribute('type') == 'application/ld+json':
				schema = json.loads(item.get_attribute('innerHTML'))

				if '@graph' in schema:
					for schemaName, thisSchema in enumerate(schema['@graph']):
						if thisSchema['@type'] == 'Organization':
							for attrName, webpageAttr in enumerate(thisSchema):
								if webpageAttr == 'logo':
									schema['@graph'][schemaName]['logo'] = thisSchema['logo']['url']
									break

	def checkRelevance(self, prompt):
		# Send search results and prompt to the OpenAI API and get search relevance, search score, and page suggestions
		config = dotenv_values(".env")
		client = openai.OpenAI(api_key = config['OPENAI_KEY'])

		stream = client.chat.completions.create(
			model="gpt-3.5-turbo",
			messages=[
				{"role": "system", "content": "You are evaluating the relevancy of a site search result page. You need to determine if the search results are relevant for a given search query, rate the relevancy of the results from 1 to 10, and recommend any additional results or search features that would be helpful for the search keyword. Only return text strings for the relevance summary and list of recommendations and an integer for the relevancy score. Please return a valid JSON file that includes a 'relevance_summary' field, 'relevancy_score' field, and 'page_recommendations' field that includes a list of three recommendations."},
				{"role": "user", "content": prompt},
			],
			response_format={ "type": "json_object" },
		)
		return stream.choices[0].message
