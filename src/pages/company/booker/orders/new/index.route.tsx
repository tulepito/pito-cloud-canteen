import MetaWrapper from '@components/MetaWrapper/MetaWrapper';

import BookerNewOrderPage from './BookerNewOrder.page';

function BookerCreateOrderRoute() {
  return (
    <MetaWrapper routeName="BookerCreateOrderRoute">
      <BookerNewOrderPage />
    </MetaWrapper>
  );
}

export default BookerCreateOrderRoute;
