import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import getCompanyNotifications from '@pages/api/apiServices/company/getCompanyNotification.service';
import cookies from '@services/cookie';
import { handleError } from '@services/sdk';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const { companyId } = req.query;
    switch (apiMethod) {
      case HttpMethod.GET: {
        const orders = await getCompanyNotifications(companyId as string);

        return res.status(200).json(orders);
      }
      case HttpMethod.POST:
        break;
      case HttpMethod.DELETE:
        break;
      case HttpMethod.PUT:
        break;
      default:
        break;
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(handler);
