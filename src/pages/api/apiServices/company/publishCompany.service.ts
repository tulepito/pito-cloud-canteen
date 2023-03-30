import { getIntegrationSdk } from '@services/integrationSdk';
import { ECompanyStates } from '@src/utils/enums';
import type { TObject } from '@src/utils/types';

const publishCompany = async (companyId: string, queryParams: TObject = {}) => {
  const integrationSdk = getIntegrationSdk();
  const response = await integrationSdk.users.updateProfile(
    {
      id: companyId,
      metadata: {
        userState: ECompanyStates.published,
      },
    },
    queryParams,
  );

  return response;
};

export default publishCompany;
