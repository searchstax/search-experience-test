# Search Experience Test

The Search Experience Test is a multi-part testing platform to evaluate the configuration and effectiveness of a website's search integration, search result page features, search relevance, site crawlability, accessibility, and other performance characteristics.

The Search Experience Test runs on Docker and includes a Flask API, Redis queue, and React front end to run Search Experience Tests. Tests are run using Playwright, Google Lighthouse, Scrapy, and OpenAI.

Run `docker-compose up --build` to start the Docker container and various services. This may take some time to download and configure the various dependencies.

## How It Works

The Search Experience Test has 4 stages. Some tests and features may not be available if a site's search bar or search page is not accessible.

### Starting a Search

- Load starting URL
- Attempt to find site search bar
- If found enter test search query and load search result page
- Capture search result URL for further testing
- Run Google Lighthouse test to evaluate site speed, SEO optimization, and accessibility

### Search Page Features

If a search page was discovered:

- Test for autocomplete
- Test for spell checking
- Check for Google Analytics

### Search Relevancy Test

If a search page was discovered:

- Fetch the search results for a given keyword
- Capture search result content and send to OpenAI API
- Display summary, relevance score, and 3 recommendations for each keyword

### Site Crawl

- Crawl a domain
- Check for titles & meta descriptions
- Check for OG:image tags
- Check for other meta tags such as publish_date

### Search Experience Score

If all tests were run successfully the Search Experience Test will show a complete score of the end-to-end search experience.