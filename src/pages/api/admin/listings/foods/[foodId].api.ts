/* eslint-disable no-console */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { HttpMethod } from '@apis/configs';
import { getIntegrationSdk, handleError } from '@services/sdk';
import isEmpty from 'lodash/isEmpty';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const integrationSdk = getIntegrationSdk();

    switch (apiMethod) {
      case HttpMethod.GET:
        {
          const { foodId, JSONParams } = req.query;
          const { dataParams = {}, queryParams = {} } = JSON.parse(
            JSONParams as string,
          );
          const response = await integrationSdk.listings.show(
            { id: foodId, ...dataParams },
            queryParams,
          );

          res.json(response);
        }
        break;

      case HttpMethod.POST:
        break;

      case HttpMethod.PUT:
        {
          const { dataParams = {}, queryParams = {} } = req.body;
          const response = await integrationSdk.listings.update(
            dataParams,
            queryParams,
          );

          res.json(response);
        }
        break;

      case HttpMethod.DELETE:
        {
          const { foodId } = req.query;
          const { dataParams = {}, queryParams = {} } = req.body;
          const { ids = [] } = dataParams;

          const updateFoodFn = (_id: string) =>
            integrationSdk.listings.update(
              {
                id: _id,
                metadata: {
                  isDeleted: true,
                },
              },
              queryParams,
            );

          const response = isEmpty(ids)
            ? await updateFoodFn(foodId as string)
            : await Promise.all(ids.map(updateFoodFn));

          res.json(response);
        }
        break;

      default:
        break;
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default handler;
