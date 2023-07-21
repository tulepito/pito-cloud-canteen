import MetaWrapper from '@components/MetaWrapper/MetaWrapper';

import DeliveryTrackingPage from './DeliveryTracking.page';

type TSubOrderDetailRouteProps = {};

const SubOrderDetailRoute: React.FC<TSubOrderDetailRouteProps> = () => {
  return (
    <MetaWrapper routeName="SubOrderDetailRoute">
      <DeliveryTrackingPage />
    </MetaWrapper>
  );
};

export default SubOrderDetailRoute;
