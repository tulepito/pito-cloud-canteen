import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import { updateUserMetadata } from '@services/integrationHelper';
import { handleError } from '@services/sdk';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { userId } = req.query;
  try {
    await updateUserMetadata(userId as string, {
      walkthroughEnable: false,
    });
    res.json({});
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(handler);
