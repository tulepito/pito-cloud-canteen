import { Client } from 'onesignal-node';

import logger from '@helpers/logger';

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
    logger.info(
      'Sending notification to OneSignal',
      `for user: ${oneSignalUserId}`,
    );

    await oneSignalClient.createNotification(notification);
    logger.success(
      'Notification sent successfully',
      `for user: ${oneSignalUserId}`,
    );
  } catch (e) {
    logger.error('Error in sendNotification', String(e));
  }
};
