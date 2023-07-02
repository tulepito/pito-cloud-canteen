import MetaWrapper from '@components/MetaWrapper/MetaWrapper';

import PartnerSubOrderDetailPage from './PartnerSubOrderDetail.page';

type TSubOrderDetailRouteProps = {};

const SubOrderDetailRoute: React.FC<TSubOrderDetailRouteProps> = () => {
  return (
    <MetaWrapper routeName="SubOrderDetailRoute">
      <PartnerSubOrderDetailPage />
    </MetaWrapper>
  );
};

export default SubOrderDetailRoute;
