import { useRouter } from 'next/router';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import { partnerPaths } from '@src/paths';

import { useFetchPartnerListing } from '../hooks/useFetchPartnerListing';

import RestaurantSettingModal from './components/RestaurantSettingModal';

const PartnerRestaurantSettingRoute = () => {
  const router = useRouter();
  useFetchPartnerListing();

  const handleClose = () => {
    router.push(partnerPaths.Settings);
  };

  return (
    <MetaWrapper routeName="PartnerRestaurantSettingRoute">
      <RestaurantSettingModal isOpen onClose={handleClose} />
    </MetaWrapper>
  );
};

export default PartnerRestaurantSettingRoute;
