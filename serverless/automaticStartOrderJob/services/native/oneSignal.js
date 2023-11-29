const { Client } = require('onesignal-node');
const config = require('../../utils/config');

const oneSignalClient = new Client(
  config.oneSignal.appId,
  config.oneSignal.apiKey,
);

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
