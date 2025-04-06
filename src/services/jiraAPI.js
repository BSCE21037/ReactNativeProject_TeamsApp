const JIRA_BASE_URL = 'https://teamsapp.atlassian.net';

export const searchIssues = async (jql, accessToken, fields = ['key', 'summary', 'status']) => {
  const response = await fetch(
    `${JIRA_BASE_URL}/rest/api/3/search?jql=${encodeURIComponent(jql)}&fields=${fields.join(',')}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    }
  );
  
  if (!response.ok) {
    throw new Error(`Jira API error: ${response.status}`);
  }
  
  return response.json();
};

export const createIssue = async (issueData, accessToken) => {
  const response = await fetch(
    `${JIRA_BASE_URL}/rest/api/3/issue`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(issueData)
    }
  );
  
  return response.json();
};