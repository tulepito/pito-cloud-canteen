import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { updateMenuAfterFoodDeletedByListId } from '@pages/api/helpers/foodHelpers';
import cookie from '@services/cookie';
import { getIntegrationSdk } from '@services/integrationSdk';
import partnerChecker from '@services/permissionChecker/partner';
import { handleError } from '@services/sdk';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;

    if (apiMethod !== HttpMethod.DELETE)
      return res.status(400).json({ message: 'Bad request' });

    const { dataParams = {}, queryParams = {} } = req.body;
    const { ids = [] } = dataParams;

    const responses = await Promise.all(
      ids.map(async (id: string) =>
        getIntegrationSdk().listings.update(
          {
            id,
            metadata: {
              isDeleted: true,
            },
          },
          queryParams,
        ),
      ),
    );

    updateMenuAfterFoodDeletedByListId(ids);

    return res.status(200).json(responses);
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookie(partnerChecker(handler));
