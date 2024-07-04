import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import { emailSendingFactory, EmailTemplateTypes } from '@services/email';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  emailSendingFactory(EmailTemplateTypes.BOOKER.BOOKER_ACCOUNT_SUSPENDED, {
    suspendedTimestamp: new Date(),
    companyId: '6486ed3d-9597-408e-a6da-2d12ac6ee18a',
  });
  res.json({
    env: process.env.AWS_SES_ACCESS_KEY_ID,
  });
}

export default cookies(handler);
