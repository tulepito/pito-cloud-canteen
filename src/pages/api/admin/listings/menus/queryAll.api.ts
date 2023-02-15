// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { queryAllListings } from '@helpers/apiHelpers';
import cookies from '@services/cookie';
import { deserialize, handleError } from '@services/sdk';
import { EListingType } from '@utils/enums';
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

  const { restaurantId } = req.body;

  try {
    const response = (await queryAllListings({
      query: {
        meta_listingType: EListingType.menu,
        meta_restaurantId: restaurantId,
        meta_isDeleted: false,
      },
    })) as any;
    res.json(response);
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(handler);
