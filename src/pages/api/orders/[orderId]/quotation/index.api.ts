import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { handleError } from '@services/sdk';

import createQuotation from './create-quotation.service';
import getQuotation from './get-quotation.service';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const apiMethod = req.method;

  switch (apiMethod) {
    case HttpMethod.GET:
      try {
        const { quotationId } = req.query;
        const data = await getQuotation(quotationId as string);

        res.json(data);
      } catch (error) {
        handleError(res, error);
      }
      break;
    case HttpMethod.POST:
      try {
        const { orderId, companyId, client, partner } = req.body;

        // Update order and return values
        const quotationListing = await createQuotation({
          orderId,
          companyId,
          client,
          partner,
        });

        return res.json(quotationListing);
      } catch (error) {
        // Return error
        handleError(res, error);
      }
      break;
    default:
      break;
  }
}

export default cookies(handler);
