import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getAuthHeader = async () => {
  const email = await AsyncStorage.getItem('email');
  const apiToken = await AsyncStorage.getItem('jiraToken');
  const base64 = btoa(`${email}:${apiToken}`);
  console.log('in getAUthHeadrer,  email:', email);
  console.log('in getAUthHeadrer,  apiToken:', apiToken);
  console.log('in getAUthHeadrer,  base64:', base64);
  return `Basic ${base64}`;
};

export const createIssue = async (issueData) => {
  try {
    const authHeader = await getAuthHeader();
    const response = await axios.post(
      'https://teamsapp.atlassian.net/rest/api/2/issue',
      {
        fields: {
          project: {
            key: issueData.projectKey || 'SCRUM',
          },
          summary: issueData.summary,
          description: issueData.description || '',
          issuetype: {
            name: issueData.issueType || 'Task',
          },
        },
      },
      {
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('Issue created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating Jira issue:', error);
    throw error;
  }
};

export const searchIssues = async (jql = '', fields = ['summary', 'status']) => {
  try {
    const authHeader = await getAuthHeader();
    const response = await axios.get(
      'https://teamsapp.atlassian.net/rest/api/2/search',
      {
        params: {
          jql,
          fields: fields.join(','),
          maxResults: 50,
        },
        headers: {
          Authorization: authHeader,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error searching Jira issues:', error);
    throw error;
  }
};