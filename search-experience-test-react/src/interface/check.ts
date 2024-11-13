
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