import type { NextApiRequest, NextApiResponse } from 'next';

import { queryAllUsers } from '@helpers/apiHelpers';
import cookies from '@services/cookie';
import adminChecker from '@services/permissionChecker/admin';
import { handleError } from '@services/sdk';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { JSONParams } = req.query;
  const { queryParams = {} } = JSON.parse(JSONParams as string);

  try {
    const response = (await queryAllUsers({
      query: {
        meta_isCompany: true,
        ...queryParams,
        include: ['profileImage'],
        'fields.image': ['variants.square-small', 'variants.square-small2x'],
      },
    })) as any;
    res.json(response);
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(adminChecker(handler));
