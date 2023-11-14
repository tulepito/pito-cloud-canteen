const { Client } = require('onesignal-node');

const { ONE_SIGNAL_APP_ID, ONE_SIGNAL_API_KEY } = process.env;

const oneSignalClient = new Client(ONE_SIGNAL_APP_ID, ONE_SIGNAL_API_KEY);

const sendNotification = async ({ title, content, url, oneSignalUserId }) => {
  const notification = {
    contents: {
      en: content,
    },
    headings: {
      en: title,
    },
    include_player_ids: [oneSignalUserId],
    data: {
      targetUrl: url,
    },
  };

  try {
    const response = await oneSignalClient.createNotification(notification);
    console.info('Notification: ', response.body);
  } catch (e) {
    console.error('Notification failed', e);
  }
};

module.exports = { sendNotification };
