import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useFetchSearchFilters from '@hooks/useFetchSearchFilters';
import { SearchFilterThunks } from '@redux/slices/SearchFilter.slice';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { shallowEqual } from 'react-redux';

import FilterSidebar from '../components/FilterSidebar/FilterSidebar';
import { useLoadData } from '../hooks/loadData';
import css from './BookerSelectRestaurant.module.scss';
import ResultDetailModal from './components/ResultDetailModal/ResultDetailModal';
import ResultList from './components/ResultList/ResultList';

function BookerSelectRestaurant() {
  const router = useRouter();
  const { timestamp, orderId, page = 1 } = router.query;
  const dispatch = useAppDispatch();
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
          page,
        }),
      );
    }
  }, [dispatch, orderId, page, timestamp]);

  const [filterMobileMenuOpen, setFilterMobileMenuOpen] = useState(false);
  const restaurants = useAppSelector(
    (state) => state.SearchFilter.searchResult,
    shallowEqual,
  );
  const searchInProgress = useAppSelector(
    (state) => state.SearchFilter.searchInProgress,
  );

  const restaurantInPage = useMemo(
    () =>
      restaurants.slice(
        parseInt(page as string, 10) - 1,
        parseInt(page as string, 10) + 9,
      ),
    [page, restaurants],
  );
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
            restaurants={restaurantInPage}
            isLoading={searchInProgress}
          />
        </div>
        <ResultDetailModal />
      </div>
    </div>
  );
}

export default BookerSelectRestaurant;
