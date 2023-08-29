import { useRouter } from 'next/router';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppSelector } from '@hooks/reduxHooks';
import { useViewport } from '@hooks/useViewport';
import { partnerPaths } from '@src/paths';
import { Listing } from '@src/utils/data';
import { formatTimestamp } from '@src/utils/dates';

import { useFetchPartnerListing } from '../hooks/useFetchPartnerListing';

import type { TRestaurantSettingFormValues } from './components/RestaurantSettingForm';
import RestaurantSettingForm from './components/RestaurantSettingForm';
import RestaurantSettingModal from './components/RestaurantSettingModal';

const PartnerRestaurantSettingRoute = () => {
  const router = useRouter();
  useFetchPartnerListing();
  const { isMobileLayout } = useViewport();
  const restaurantListing = useAppSelector(
    (state) => state.PartnerSettingsPage.restaurantListing,
  );

  const { isActive = true } = Listing(restaurantListing).getPublicData();

  const stopReceiveOrderInfo = `${formatTimestamp()} -  ${formatTimestamp()}`;
  const dayOffInfo = `${formatTimestamp()} -  ${formatTimestamp()}`;

  const handleClose = () => {
    router.push(partnerPaths.Settings);
  };

  const handleSubmit = async (_values: TRestaurantSettingFormValues) => {};

  return (
    <MetaWrapper routeName="PartnerRestaurantSettingRoute">
      <RenderWhen condition={isMobileLayout}>
        <RestaurantSettingModal isOpen onClose={handleClose} />
        <RenderWhen.False>
          <RestaurantSettingForm
            onSubmit={handleSubmit}
            initialValues={{
              isActive,
              dayOffInfo,
              stopReceiveOrderInfo,
            }}
          />
        </RenderWhen.False>
      </RenderWhen>
    </MetaWrapper>
  );
};

export default PartnerRestaurantSettingRoute;
