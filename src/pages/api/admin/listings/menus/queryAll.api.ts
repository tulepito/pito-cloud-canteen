// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { queryAllListings } from '@helpers/apiHelpers';
import cookies from '@services/cookie';
import { handleError } from '@services/sdk';
import { EListingType } from '@utils/enums';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
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
