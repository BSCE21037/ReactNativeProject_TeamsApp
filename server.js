require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const qs = require("querystring");

const app = express();
app.use(express.json());
app.use(cors());

const {
  JIRA_BASE_URL,
  JIRA_CLIENT_ID,
  JIRA_CLIENT_SECRET,
  JIRA_REDIRECT_URI,
  JIRA_AUTH_URL,
  JIRA_API_URL,
  JIRA_PROJECT_KEY,
} = process.env;

// Store access token (this should be handled in a proper auth system)
let ACCESS_TOKEN = "";

// 🟢 Step 1: Redirect User to JIRA Authorization Page
app.get("/auth/jira", (req, res) => {
  const authURL = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${JIRA_CLIENT_ID}&scope=read:jira-user read:jira-work write:jira-work&redirect_uri=${JIRA_REDIRECT_URI}&response_type=code&prompt=consent`;

  res.redirect(authURL);
});

// 🔵 Step 2: Handle Callback and Exchange Code for Access Token
app.get("/oauth/callback", async (req, res) => {
  const { code } = req.query;

  try {
    const response = await axios.post(
      JIRA_AUTH_URL,
      qs.stringify({
        grant_type: "authorization_code",
        client_id: JIRA_CLIENT_ID,
        client_secret: JIRA_CLIENT_SECRET,
        code,
        redirect_uri: JIRA_REDIRECT_URI,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    ACCESS_TOKEN = response.data.access_token;
    res.send("OAuth Success! You can now use JIRA API.");
  } catch (error) {
    console.error("OAuth Error:", error.response?.data);
    res.status(500).json({ error: "OAuth failed" });
  }
});

// 🟡 Step 3: Get JIRA Cloud ID
const getJiraCloudId = async () => {
  try {
    const response = await axios.get("https://api.atlassian.com/oauth/token/accessible-resources", {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    });

    return response.data[0].id; // First workspace
  } catch (error) {
    console.error("Error getting Cloud ID:", error.response?.data);
    return null;
  }
};

// 🟣 Step 4: Create a JIRA Task
app.post("/create-task", async (req, res) => {
  if (!ACCESS_TOKEN) return res.status(401).json({ error: "Unauthorized. Login first." });

  const { summary, description, issueType } = req.body;

  try {
    const cloudId = await getJiraCloudId();
    if (!cloudId) return res.status(500).json({ error: "Failed to fetch Cloud ID" });

    const response = await axios.post(
      `${JIRA_API_URL}/${cloudId}/rest/api/3/issue`,
      {
        fields: {
          project: { key: JIRA_PROJECT_KEY },
          summary,
          description,
          issuetype: { name: issueType || "Task" },
        },
      },
      {
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      }
    );

    res.json({ message: "Task created!", taskId: response.data.id });
  } catch (error) {
    console.error("Error creating task:", error.response?.data);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// 🚀 Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
