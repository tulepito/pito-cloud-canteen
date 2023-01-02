/* eslint-disable no-console */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import cookies from '@services/cookie';
import { deserialize, getIntegrationSdk, handleError } from '@services/sdk';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    if (
      req.headers['content-type'] === 'application/transit+json' &&
      typeof req.body === 'string'
    ) {
      try {
        req.body = deserialize(req.body);
      } catch (e) {
        console.error('Failed to parse request body as Transit:');
        console.error(e);
        res.status(400).send('Invalid Transit in request body.');
        return;
      }
    }
    const { dataParams, queryParams = {} } = req.body;
    const intergrationSdk = getIntegrationSdk();
    const response = await intergrationSdk.listings.update(
      dataParams,
      queryParams,
    );
    res.json(response);
  } catch (error) {
    console.log(error);
    handleError(res, error);
  }
}

export default cookies(handler);
