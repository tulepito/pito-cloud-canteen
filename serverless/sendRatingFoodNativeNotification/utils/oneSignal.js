// import * as OneSignal from '@onesignal/node-onesignal';
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
    await oneSignalClient.createNotification(notification);
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  sendNotification,
};
