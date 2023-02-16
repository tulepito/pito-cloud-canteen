/* eslint-disable no-console */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import cookies from '@services/cookie';
import { getIntegrationSdk, handleError } from '@services/sdk';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { dataParams, queryParams = {} } = req.body;
    const intergrationSdk = getIntegrationSdk();

    const { ids = [], id } = dataParams;

    let response;

    if (ids && ids.length > 0) {
      response = await Promise.all(
        ids.map(async (i: string) => {
          return intergrationSdk.listings.update(
            {
              id: i,
              metadata: {
                isDeleted: true,
              },
            },
            queryParams,
          );
        }),
      );
    } else {
      response = await intergrationSdk.listings.update(
        {
          id,
          metadata: {
            isDeleted: true,
          },
        },
        queryParams,
      );
    }

    res.json(response);
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(handler);
