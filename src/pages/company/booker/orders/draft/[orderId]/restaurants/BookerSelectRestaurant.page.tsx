import { useAppDispatch } from '@hooks/reduxHooks';
import useFetchSearchFilters from '@hooks/useFetchSearchFilters';
import { SearchFilterThunks } from '@redux/slices/SearchFilter.slice';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import FilterSidebar from '../components/FilterSidebar/FilterSidebar';
import { useLoadData } from '../hooks/loadData';
import css from './BookerSelectRestaurant.module.scss';
import ResultDetailModal from './components/ResultDetailModal/ResultDetailModal';
import ResultList from './components/ResultList/ResultList';

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

  const [filterMobileMenuOpen, setFilterMobileMenuOpen] = useState(false);

  const handleFilterMobileMenuClick = () => {
    setFilterMobileMenuOpen(!filterMobileMenuOpen);
  };

  return (
    <div className={css.root}>
      <div className={css.main}>
        <div
          className={classNames(css.filterMobileMenu, {
            [css.filterMobileMenuOpened]: filterMobileMenuOpen,
          })}
          onClick={handleFilterMobileMenuClick}>
          Menu
        </div>
        <div
          className={classNames(css.sidebar, {
            [css.sidebarOpened]: filterMobileMenuOpen,
          })}>
          <FilterSidebar />
        </div>
        <div className={css.result}>
          <ResultList
            className={css.resultList}
            restaurants={[
              { id: '1' },
              { id: '2' },
              { id: '3' },
              { id: '4' },
              { id: '5' },
            ]}
          />
        </div>
        <ResultDetailModal />
      </div>
    </div>
  );
}

export default BookerSelectRestaurant;
