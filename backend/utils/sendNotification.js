const { google } = require("google-auth-library");
const fetch = require("node-fetch");
require('dotenv').config();
const serviceAccount = {
  project_id: process.env.GOOGLE_PROJECT_ID,
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
};

const SCOPES = ["https://www.googleapis.com/auth/firebase.messaging"];
const PROJECT_ID = serviceAccount.project_id;

async function getAccessToken() {
  const client = new google.auth.JWT(
    serviceAccount.client_email,
    null,
    serviceAccount.private_key,
    SCOPES
  );
  const tokens = await client.authorize();
  return tokens.access_token;
}

async function sendNotification(token, notification) {
  const accessToken = await getAccessToken();

  const res = await fetch(
    `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          token,
          notification,
        },
      }),
    }
  );

  const data = await res.json();
  console.log("Respuesta FCM:", data);
  return data;
}

module.exports = { sendNotification };
