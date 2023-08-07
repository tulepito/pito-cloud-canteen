import type { NextApiRequest, NextApiResponse } from 'next';

import { queryAllPages } from '@helpers/apiHelpers';
import cookies from '@services/cookie';
import { fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { handleError } from '@services/sdk';
import { User } from '@src/utils/data';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const integrationSdk = getIntegrationSdk();
    const { JSONParams } = req.query;
    const { dataParams = {} } = JSON.parse(JSONParams as string) || {};
    const { createdAtStart, createdAtEnd, companyId } = dataParams;
    const company = await fetchUser(companyId);

    const companyUser = User(company);
    const { subAccountId } = companyUser.getPrivateData();

    const allowedParams = {
      ...(createdAtStart && { createdAtStart }),
      ...(createdAtEnd && { createdAtEnd }),
      ...(companyId && subAccountId && { userId: subAccountId }),
    };
    const txs = await queryAllPages({
      sdkModel: integrationSdk.transactions,
      query: allowedParams,
    });

    res.json(txs);
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(handler);
