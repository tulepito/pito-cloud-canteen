import { getIntegrationSdk } from '@services/integrationSdk';
import { ECompanyStates } from '@src/utils/enums';
import type { TObject } from '@src/utils/types';

const unactiveCompany = async (
  companyId: string,
  queryParams: TObject = {},
) => {
  const integrationSdk = getIntegrationSdk();
  const response = await integrationSdk.users.updateProfile(
    {
      id: companyId,
      metadata: {
        userState: ECompanyStates.unactive,
      },
    },
    queryParams,
  );

  return response;
};

export default unactiveCompany;
