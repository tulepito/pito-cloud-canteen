import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import { handleError } from '@services/sdk';
import { createSlackNotification } from '@services/slackNotification';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { notificationType, params } = req.body;
    console.log('notificationType', notificationType);
    await createSlackNotification(notificationType, params);

    return res.status(200).json({});
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(handler);
