/* eslint-disable @typescript-eslint/no-shadow */
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { queryAllUsers } from '@helpers/apiHelpers';
import createCompany from '@pages/api/apiServices/company/createCompany.service';
import cookies from '@services/cookie';
import adminChecker from '@services/permissionChecker/admin';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { JSONParams } = req.query;
  const { queryParams = {} } = JSON.parse(JSONParams as string);

  switch (req.method) {
    case HttpMethod.GET: {
      const response = (await queryAllUsers({
        query: {
          meta_isCompany: true,
          ...queryParams,
          include: ['profileImage'],
          'fields.image': ['variants.square-small', 'variants.square-small2x'],
        },
      })) as any;

      return res.json(response);
    }
    case HttpMethod.POST: {
      const { dataParams, queryParams = {} } = req.body;
      const company = await createCompany({
        req,
        res,
        dataParams,
        queryParams,
      });

      return res.json(company);
    }

    default: {
      return res.status(500).json('Method not allowed');
    }
  }
}

export default cookies(adminChecker(handler));
