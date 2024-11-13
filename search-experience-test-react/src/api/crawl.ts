import type { crawlResponse } from '../interface/crawlResult';

export const crawl = async (
  requestURL: string,
): Promise<crawlResponse> => {
  const url = new URL(`${import.meta.env.VITE_FLASK_API ?? ''}/crawl-url`);
  const data = {
	  'url': requestURL,
  };
  return await fetch(url.href, {
    method: 'post',
    body: JSON.stringify(data),
    headers: {
      'Content-type':'application/json', 
      'Accept':'application/json'
    }
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('error')
      }
      return await response.json();
    })
    .catch((error: Error) => {
      throw error
    });
}

export const getCrawl = async (
  crawlID: string,
): Promise<crawlResponse> => {
  const url = new URL(`${import.meta.env.VITE_FLASK_API ?? ''}/check-crawl`);
  const data = {
	  'crawlID': crawlID,
  };
  return await fetch(url.href, {
    method: 'post',
    body: JSON.stringify(data),
    headers: {
      'Content-type':'application/json', 
      'Accept':'application/json'
    }
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('error')
      }
      return await response.json();
    })
    .catch((error: Error) => {
      throw error
    });
}
