import IconMenu from '@components/Icons/IconMenu/IconMenu';
import { useAppSelector } from '@hooks/reduxHooks';
import { User } from '@utils/data';
import type { TUser } from '@utils/types';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import css from './BookerSelectRestaurant.module.scss';
import FilterLabelList from './components/FilterLabelList/FilterLabelList';
import FilterSidebar from './components/FilterSidebar/FilterSidebar';
import KeywordSearchSection from './components/KeywordSearchSection/KeywordSearchSection';
import ResultList from './components/ResultList/ResultList';
import SortingDropdown from './components/SortingDropdown/SortingDropdown';
import { useGetCompanyAccount } from './hooks/company';
import { useLoadData } from './hooks/loadData';
import { useSearchRestaurants } from './hooks/restaurants';

function BookerSelectRestaurant() {
  const intl = useIntl();

  const router = useRouter();
  const { timestamp, orderId, sortBy } = router.query;

  const [filterMobileMenuOpen, setFilterMobileMenuOpen] = useState(false);
  const [currentSortBy, setCurrentSortBy] = useState<string>(
    (sortBy as string) || 'favorite',
  );

  useLoadData({ orderId: orderId as string });
  const { companyAccount } = useGetCompanyAccount();
  const { restaurants, searchInProgress, totalResultItems, totalRatings } =
    useSearchRestaurants();

  const restaurantFood = useAppSelector(
    (state) => state.BookerSelectRestaurant.restaurantFood,
    shallowEqual,
  );

  const companyGeoOrigin = useMemo(
    () => ({
      ...User(companyAccount as TUser).getPublicData()?.location?.origin,
    }),
    [companyAccount],
  );

  const handleFilterMobileMenuClick = useCallback(() => {
    setFilterMobileMenuOpen(!filterMobileMenuOpen);
  }, [filterMobileMenuOpen]);

  const onChangeSortBy = useCallback(
    (value: string) => {
      setCurrentSortBy(value);
      router.push({
        query: {
          ...router.query,
          sortBy: value,
        },
      });
    },
    [router],
  );

  return (
    <div className={css.root}>
      <div className={css.main}>
        <div
          className={classNames(css.filterMobileMenu, {
            [css.filterMobileMenuOpened]: filterMobileMenuOpen,
          })}
          onClick={handleFilterMobileMenuClick}>
          <IconMenu />
        </div>
        <div
          className={classNames(css.sidebar, {
            [css.sidebarOpened]: filterMobileMenuOpen,
          })}>
          <FilterSidebar />
        </div>
        <div className={css.result}>
          <div className={css.resultHeaderWrapper}>
            <div className={css.searchAndSort}>
              <KeywordSearchSection />
              <SortingDropdown
                selectedValue={intl.formatMessage({
                  id: `BookerSelectRestaurant.sortOption.${currentSortBy}`,
                })}
                onOptionChange={onChangeSortBy}
              />
            </div>
            <div className={css.filterLabelWrapper}>
              <div className={css.resultNumber}>
                {intl.formatMessage(
                  { id: 'BookerSelectRestaurant.resultNumber' },
                  { totalResultItems },
                )}
              </div>
              <FilterLabelList />
            </div>
          </div>
          <div className={css.resultWrapper}>
            <ResultList
              className={css.resultList}
              restaurants={restaurants}
              isLoading={searchInProgress}
              companyGeoOrigin={companyGeoOrigin}
              totalRatings={totalRatings}
              timestamp={+timestamp!}
              restaurantFood={restaurantFood}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookerSelectRestaurant;
