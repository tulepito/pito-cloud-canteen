import MetaWrapper from '@components/MetaWrapper/MetaWrapper';

import TrackingPage from './Tracking.page';

type TTrackingSubOrderDetailRouteProps = {};

const TrackingSubOrderDetailRoute: React.FC<
  TTrackingSubOrderDetailRouteProps
> = () => {
  return (
    <MetaWrapper routeName="TrackingSubOrderDetailRoute">
      <TrackingPage />
    </MetaWrapper>
  );
};

export default TrackingSubOrderDetailRoute;
