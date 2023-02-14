import { getIntegrationSdk } from '@services/integrationSdk';
import { denormalisedResponseEntities } from '@utils/data';

const queryCompanies = async ({
  companyIdList,
}: {
  companyIdList: string[];
}) => {
  const integrationSdk = getIntegrationSdk();
  const companyListRes = await integrationSdk.users.query({
    meta_id: companyIdList.join(','),
  });
  const companyList = denormalisedResponseEntities(companyListRes);

  return companyList;
};

export default queryCompanies;
