// import * as OneSignal from '@onesignal/node-onesignal';
import { Client } from 'onesignal-node';

const { ONE_SIGNAL_APP_ID, ONE_SIGNAL_API_KEY } = process.env;

const oneSignalClient = new Client(ONE_SIGNAL_APP_ID!, ONE_SIGNAL_API_KEY!);

export const sendNotification = async ({
  title,
  content,
  url,
  oneSignalUserId,
}: {
  title: string;
  content: string;
  url: string;
  oneSignalUserId: string;
}) => {
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
    console.log('Notification: ', response.body);
  } catch (e) {
    console.log(e);
  }
};
