import type { testResponse } from '../interface/test';

export const testURL = async (
  requestURL: string,
  terms: string,
): Promise<testResponse> => {
  const url = new URL(`${import.meta.env.VITE_FLASK_API ?? ''}/request`);
  const data = {
	  'url': requestURL,
    'terms': terms,
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

export const getStatus = async (
  testID: string,
): Promise<testResponse> => {
  const url = new URL(`${import.meta.env.VITE_FLASK_API ?? ''}/check-test`);
  const data = {
    'testID': testID,
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

export const getTest = async (
  testID: string,
): Promise<testResponse> => {
  const url = new URL(`${import.meta.env.VITE_FLASK_API ?? ''}/load-test`);
  const data = {
    'testID': testID,
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

export const getTestHistory = async (
): Promise<testResponse> => {
  const url = new URL(`${import.meta.env.VITE_FLASK_API ?? ''}/test-history`);
  const data = {};
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