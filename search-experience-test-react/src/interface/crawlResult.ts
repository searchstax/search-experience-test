
export interface facetOption {
	name: string,
	count: number,
}

export interface crawlFacet {
  name: string,
	options: facetOption[],
}

export interface crawlResult {
  url: string,
  text: string,
  title: string,
	image?: string,
	description?: string,
}

export interface crawlResponse {
  status: boolean,
  data: {
		crawlID: string,
		status?: number,
		pageData?: crawlResult[],
		facetData?: crawlFacet[],
  }
}