/* eslint-disable no-console */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { queryAllUsers } from '@helpers/apiHelpers';
import cookies from '@services/cookie';
import { deserialize, handleError } from '@services/sdk';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
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
  try {
    const response = await queryAllUsers({
      query: {
        meta_isCompany: true,
      },
    });
    res.json(response);
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(handler);
