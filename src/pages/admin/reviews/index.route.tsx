import MetaWrapper from '@components/MetaWrapper/MetaWrapper';

import OrderReviewPage from './OrderReview.page';

export default function AdminOrderReviewRoute() {
  return (
    <MetaWrapper routeName="AdminOrderReviewRoute">
      <OrderReviewPage />
    </MetaWrapper>
  );
}
