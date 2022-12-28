import Axios from 'axios';

function dictToQuery(dict) {
	let query = "";
	let queryKeys = Object.keys(dict);
	for (let i = 0; i < queryKeys.length; i++) {
		// If key is "allFields", replace it with "any_field"
		let key = queryKeys[i];
		if (key === "allFields") {
			key = "any_field";
		}
		if (dict[queryKeys[i]] !== undefined && dict[queryKeys[i]] !== null && dict[queryKeys[i]] !== "") {
			query += `${key}=${dict[queryKeys[i]]}&`;
		}
	}
	// Remove the last &
	query = query.slice(0, -1);
	return query;
}

export default class AO3Wrapper {
	constructor() {
		this.baseURL = global.config.ao3api.url;
		this.axios = Axios.create({
			baseURL: global.config.ao3api.url,
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
				'Content-Type': 'application/json'
			}
		});
	}

	async searchWorks(searchQuery = {}) {
		if (!searchQuery) {
			throw new Error('No search query provided.');
		}
		try {
			const response = await this.axios.get('/search?' + dictToQuery(searchQuery));
			if (response.status !== 200) {
				global.logger.warn('AO3Wrapper: Search failed with status code ' + response.status);
				return [];
			} else {
				return response.data.results;
			}
		} catch (error) {
			global.logger.warn('AO3Wrapper: Search failed with error ' + error);
			return [];
		}
	}

	async getWorkMetadata(workId) {
		if (!workId) {
			throw new Error('No work ID provided.');
		}
		const response = await this.axios.get('/metadata/' + workId);
		if (response.status !== 200) {
			throw new Error('Work not found.');
		} else {
			return response.data.metadata;
		}
	}

	async getWorkChapters(workId) {
		if (!workId) {
			throw new Error('No work ID provided.');
		}
		const response = await this.axios.get('/chapters/' + workId);
		if (response.status !== 200) {
			throw new Error('Work not found.');
		} else {
			return response.data.chapters;
		}
	}

	async getWorkChapter(workId, chapterNumber) {
		if (!workId) {
			throw new Error('No work ID provided.');
		}
		if (!chapterNumber) {
			throw new Error('No chapter number provided.');
		}
		const response = await this.axios.get('/chapter/' + workId + '/' + chapterNumber);
		if (response.status !== 200) {
			throw new Error('Work not found.');
		} else {
			return response.data;
		}
	}
}