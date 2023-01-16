import Meta from '@components/Layout/Meta';
import { useAppDispatch } from '@hooks/reduxHooks';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useIntl } from 'react-intl';

import { BookerOrderManagementsThunks } from './BookerOrderManagement.slice';
import BookerOrderDetailsPage from './components/BookerOrderDetails.page';

const BookerOrderDetailsRoute = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const {
    isReady,
    query: { orderId },
  } = useRouter();

  useEffect(() => {
    if (isReady) {
      dispatch(BookerOrderManagementsThunks.loadData(orderId as string));
    }
  }, [isReady]);

  return (
    <>
      <Meta
        title={intl.formatMessage({ id: 'BookerOrderDetailsRoute.title' })}
      />
      <BookerOrderDetailsPage />
    </>
  );
};

export default BookerOrderDetailsRoute;
