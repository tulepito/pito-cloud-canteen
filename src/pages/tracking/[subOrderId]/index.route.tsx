import MetaWrapper from '@components/MetaWrapper/MetaWrapper';

import TrackingPage from './Tracking.page';

type TSubOrderDetailRouteProps = {};

const SubOrderDetailRoute: React.FC<TSubOrderDetailRouteProps> = () => {
  return (
    <MetaWrapper routeName="SubOrderDetailRoute">
      <TrackingPage />
    </MetaWrapper>
  );
};

export default SubOrderDetailRoute;
