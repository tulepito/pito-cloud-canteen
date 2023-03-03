import type { NextApiRequest, NextApiResponse } from 'next';

import { queryAllUsers } from '@helpers/apiHelpers';
import cookies from '@services/cookie';
import { handleError } from '@services/sdk';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const response = (await queryAllUsers({
      query: {
        meta_isCompany: true,
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

export default cookies(handler);
