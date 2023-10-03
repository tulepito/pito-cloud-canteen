import { getIntegrationSdk } from '@services/integrationSdk';
import type { TObject } from '@src/utils/types';

export const publishFood = async (
  foodId: string,
  queryParams: TObject = {},
) => {
  const integrationSdk = getIntegrationSdk();
  const response = await integrationSdk.listings.update(
    {
      id: foodId,
      metadata: {
        isFoodEnable: true,
      },
    },
    queryParams,
  );

  return response;
};
