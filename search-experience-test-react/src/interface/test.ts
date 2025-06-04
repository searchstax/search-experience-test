
export interface searchQuality {
	query: string,
	quality: {
		relevance_summary: string,
		relevancy_score: number,
		page_recommendations: string[],
	}
}

export interface relevanceData {
	searchpage: {
		startURL: string,
		searchURL: string,
		searchQuality?: searchQuality[],
		mainColors?: any[],
		searchFeatures?: any[]
	},
	screenshots: {
		original: string,
		search: string
	}
}

export interface relevanceResponse {
	status: boolean,
	data: relevanceData
}

export interface testResponse {
	status: number,
	testID: string,
	crawl?: {
		status: number,
		data?: {
			facetData?: [],
			pageData?: [],
		},
	},
	lighthouse?: {
		status: number,
		data: {
			accessibility?: number,
			performance?: number,
			seo?: number,
		},
	},
	search?: {
		status: number,
		data: {
			screenshots?: {
				original: string,
				search: string,
			},
			searchFeatures?: {
				autocomplete: boolean,
				googleAnalytics: boolean,
				spellchecking: boolean
			},
			searchpage?: {
				mainColors?: any[],
				schema?: {},
				searchURL?: string,
				sitesearch?: {
					coverage: number,
					height: number,
					width: number,
				},
				startURL: string,
			},
			searchQuality: {
				query: string,
				quality: {
					page_recommendations: string,
					relevance_summary: string,
					relevancy_score: string,
				}
			}[]
		},
	}
}