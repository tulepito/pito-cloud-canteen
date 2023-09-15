import isEmpty from 'lodash/isEmpty';
import type { NextApiRequest, NextApiResponse } from 'next';

import { composeApiCheckers } from '@apis/configs';
import { EHttpStatusCode } from '@apis/errors';
import { queryAllPages } from '@helpers/apiHelpers';
import { getIntegrationSdk } from '@services/integrationSdk';
import companyChecker from '@services/permissionChecker/company';
import { EImageVariants } from '@utils/enums';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { companyId } = req.query;

  try {
    if (isEmpty(companyId)) {
      return res.status(EHttpStatusCode.BadRequest).json({
        error: 'Missing companyId',
      });
    }
    const integrationSdk = getIntegrationSdk();

    const allMembersResponse = await queryAllPages({
      sdkModel: integrationSdk.users,
      query: {
        meta_companyList: `has_all:${companyId}`,
        include: ['profileImage'],
        'fields.image': [
          `variants.${EImageVariants.squareSmall}`,
          `variants.${EImageVariants.squareSmall2x}`,
        ],
      },
    });

    return res.json(allMembersResponse);
  } catch (error) {
    console.error('Error query all company members, company ID: ', companyId);
  }
}

export default composeApiCheckers(companyChecker)(handler);
