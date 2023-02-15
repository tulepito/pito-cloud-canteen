import RestaurantCard from '@components/RestaurantCard/RestaurantCard';
import { useAppDispatch } from '@hooks/reduxHooks';
import useFetchSearchFilters from '@hooks/useFetchSearchFilters';
import { SearchFilterThunks } from '@redux/slices/SearchFilter.slice';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import Layout from '../../../components/Layout/Layout';
import FilterSidebar from '../components/FilterSidebar/FilterSidebar';
import { useLoadData } from '../hooks/loadData';
import css from './BookerSelectRestaurant.module.scss';

function BookerSelectRestaurant() {
  const router = useRouter();
  const { timestamp, orderId } = router.query;
  const dispatch = useAppDispatch();
  console.log('timestamp', timestamp);
  useFetchSearchFilters();
  useLoadData({
    orderId: orderId as string,
  });
  useEffect(() => {
    if (timestamp) {
      dispatch(
        SearchFilterThunks.searchRestaurants({
          timestamp: Number(timestamp),
          orderId,
        }),
      );
    }
  });

  return (
    <Layout className={css.root}>
      <div>
        <FilterSidebar />
        <RestaurantCard />
      </div>
    </Layout>
  );
}

export default BookerSelectRestaurant;
