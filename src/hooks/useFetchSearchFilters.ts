import { BookerSelectRestaurantThunks } from '@pages/company/booker/orders/draft/[orderId]/restaurants/BookerSelectRestaurant.slice';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { useAppDispatch } from './reduxHooks';

const useFetchSearchFilters = () => {
  const dispatch = useAppDispatch();
  const { isReady } = useRouter();

  useEffect(() => {
    if (isReady) {
      (async () => {
        await dispatch(BookerSelectRestaurantThunks.fetchSearchFilter());
      })();
    }
  }, [dispatch, isReady]);
};

export default useFetchSearchFilters;
