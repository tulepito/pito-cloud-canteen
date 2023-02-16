import cookies from '@services/cookie';
import { getIntegrationSdk } from '@services/integrationSdk';
import { denormalisedResponseEntities } from '@utils/data';
import { EImageVariants } from '@utils/enums';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { companyId } = req.query;
  const integrationSdk = getIntegrationSdk();
  const allMembersResponse = denormalisedResponseEntities(
    await integrationSdk.users.query({
      meta_companyList: `has_all:${companyId}`,
      include: ['profileImage'],
      'fields.image': [
        `variants.${EImageVariants.squareSmall}`,
        `variants.${EImageVariants.squareSmall2x}`,
      ],
    }),
  );

  res.json(allMembersResponse);
}

export default cookies(handler);
