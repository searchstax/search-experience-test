import type { relevanceResponse } from '../interface/check';

export const checkURL = async (
  requestURL: string,
): Promise<relevanceResponse> => {
  const url = new URL(`${import.meta.env.VITE_FLASK_API ?? ''}/test-url`);
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

export const checkRelevance = async (
  requestURL: string,
  searchTerm: string,
): Promise<relevanceResponse> => {
  const url = new URL(`${import.meta.env.VITE_FLASK_API ?? ''}/test-search`);
  const data = {
    'url': requestURL,
    'searchTerm': searchTerm,
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

export const checkFeatures = async (
  requestURL: string,
): Promise<relevanceResponse> => {
  const url = new URL(`${import.meta.env.VITE_FLASK_API ?? ''}/test-features`);
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
