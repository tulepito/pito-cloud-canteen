import { updateMenuAfterFoodDeleted } from '@pages/api/helpers/foodHelpers';
import { getIntegrationSdk } from '@services/sdk';

export const closeFood = async (foodId: string, queryParams: any = {}) => {
  const integrationSdk = getIntegrationSdk();
  const response = await integrationSdk.listings.update(
    {
      id: foodId,
      metadata: {
        isFoodEnable: false,
      },
    },
    queryParams,
  );

  updateMenuAfterFoodDeleted(foodId);

  return response;
};
