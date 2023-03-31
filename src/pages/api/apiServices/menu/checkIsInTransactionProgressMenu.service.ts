import { getIntegrationSdk } from '@services/integrationSdk';
import { EListingType, EOrderStates } from '@src/utils/enums';
import type { TObject } from '@src/utils/types';

const checkIsInTransactionProgressMenu = async (
  menuId: string,
  queryParams: TObject = {},
) => {
  const integrationSdk = getIntegrationSdk();
  const response = await integrationSdk.listings.query(
    {
      meta_menuIds: `has_any:${menuId}`,
      meta_listingType: EListingType.subOrder,
      meta_orderState: [EOrderStates.inProgress, EOrderStates.picking],
    },
    queryParams,
  );
  const { totalItems } = response.data.meta;
  const isInTransactionProgress = totalItems.length > 0;

  return isInTransactionProgress;
};

export default checkIsInTransactionProgressMenu;
