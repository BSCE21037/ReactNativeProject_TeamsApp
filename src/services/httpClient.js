import axios from 'axios';

export default class JiraClient {
  constructor(baseURL, auth) {
    this.axios = axios.create({
      baseURL: `${baseURL}/rest/api/3`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${auth.email}:${auth.apiToken}`)}`
      }
    });
  }


  async _request(method, endpoint, data = null) {
    try {
      const response = await this.axios({
        method,
        url: endpoint,
        data
      });
      return response.data;
    } catch (error) {
      console.error('Jira API Error:', error.response?.data || error.message);
      throw error;
    }
  }

 
  async getIssue(issueId) {
    return this._request('get', `/issue/${issueId}`);
  }

  async createIssue(issueData) {
    return this._request('post', '/issue', issueData);
  }

}
