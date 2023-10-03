import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import partnerChecker from '@services/permissionChecker/partner';
import { handleError } from '@services/sdk';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    // eslint-disable-next-line unused-imports/no-unused-vars
    const { dataParams, queryParams = {} } = req.body;

    switch (apiMethod) {
      case HttpMethod.PUT: {
        const menu = {};

        return res.status(200).json(menu);
      }

      default:
        break;
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(partnerChecker(handler));
