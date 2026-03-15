const { google } = require('googleapis');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { game_date_opponent, peak_viewers, total_views, lessons_learned } = JSON.parse(event.body);
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccountEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const newRow = [
      new Date().toISOString(),
      game_date_opponent,
      peak_viewers,
      total_views,
      lessons_learned,
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Sheet1!A1', // This will append to the first empty row of 'Sheet1'
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [newRow],
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Successfully wrote to Google Sheet.' }),
    };
  } catch (error) {
    console.error('Error writing to Google Sheet:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to write to Google Sheet.' }),
    };
  }
};
