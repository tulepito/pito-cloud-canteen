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
    include: ['profileImage'],
    'fields.image': ['variants.square-small', 'variants.square-small2x'],
  });
  const companyList = denormalisedResponseEntities(companyListRes);

  return companyList;
};

export default queryCompanies;
