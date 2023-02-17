import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useFetchSearchFilters from '@hooks/useFetchSearchFilters';
import KeywordSearchForm from '@pages/admin/partner/components/KeywordSearchForm/KeywordSearchForm';
import { SearchFilterThunks } from '@redux/slices/SearchFilter.slice';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import FilterSidebar from '../components/FilterSidebar/FilterSidebar';
import { useLoadData } from '../hooks/loadData';
import css from './BookerSelectRestaurant.module.scss';
import ResultList from './components/ResultList/ResultList';
import SortingDropdown from './components/SortingDropdown/SortingDropdown';

function BookerSelectRestaurant() {
  const router = useRouter();

  const {
    timestamp,
    orderId,
    page = 1,
    menuTypes,
    categories,
    distance,
    rating,
    sortBy,
    keywords,
  } = router.query;

  const dispatch = useAppDispatch();
  const intl = useIntl();

  useFetchSearchFilters();

  useLoadData({
    orderId: orderId as string,
  });

  useEffect(() => {
    dispatch(
      SearchFilterThunks.searchRestaurants({
        timestamp: Number(timestamp),
        orderId,
        page,
        ...(menuTypes ? { menuTypes: (menuTypes as string).split(',') } : {}),
        ...(categories
          ? { categories: (categories as string).split(',') }
          : {}),
        ...(distance ? { distance: (distance as string).split(',') } : {}),
        ...(rating ? { rating: (rating as string).split(',') } : {}),
        ...(keywords ? { keywords: keywords as string } : {}),
      }),
    );
  }, [
    categories,
    dispatch,
    distance,
    menuTypes,
    orderId,
    page,
    rating,
    timestamp,
    keywords,
  ]);

  const [filterMobileMenuOpen, setFilterMobileMenuOpen] = useState(false);
  const [currentSortBy, setCurrentSortBy] = useState<string>(
    (sortBy as string) || 'favorite',
  );

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
  const initialValues = useMemo(() => {
    return {
      menuTypes: menuTypes ? (menuTypes as string).split(',') : [],
      categories: categories ? (categories as string).split(',') : [],
      distance: distance ? (distance as string).split(',') : [],
      rating: rating ? (rating as string).split(',') : [],
    };
  }, [categories, distance, menuTypes, rating]);

  const sortingOptions = useMemo(() => {
    return [
      {
        label: intl.formatMessage({
          id: 'BookerSelectRestaurant.sortOption.favorite',
        }),
        value: 'favorite',
      },
      {
        label: intl.formatMessage({
          id: 'BookerSelectRestaurant.sortOption.newest',
        }),
        value: 'newest',
      },
      {
        label: intl.formatMessage({
          id: 'BookerSelectRestaurant.sortOption.mostOrder',
        }),
        value: 'mostOrder',
      },
    ];
  }, [intl]);

  const keywordsInitialValue = useMemo(() => {
    return {
      keywords: (keywords as string) || '',
    };
  }, [keywords]);

  const handleFilterMobileMenuClick = () => {
    setFilterMobileMenuOpen(!filterMobileMenuOpen);
  };

  const onChangeSortBy = (value: string) => {
    setCurrentSortBy(value);
    router.push({
      query: {
        ...router.query,
        sortBy: value,
      },
    });
  };

  const onSearchKeywordsSubmit = (values: any) => {
    const newQuery = { ...router.query };
    if (!values.keywords) {
      delete newQuery.keywords;
    } else {
      newQuery.keywords = values.keywords;
    }

    router.push({
      query: {
        ...newQuery,
      },
    });
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
          <FilterSidebar initialValues={initialValues} />
        </div>
        <div className={css.result}>
          <div className={css.resultHeaderWrapper}>
            <div className={css.searchAndSort}>
              <KeywordSearchForm
                onSubmit={onSearchKeywordsSubmit}
                initialValues={keywordsInitialValue}
              />
              <SortingDropdown
                options={sortingOptions}
                selectedValue={intl.formatMessage({
                  id: `BookerSelectRestaurant.sortOption.${currentSortBy}`,
                })}
                onOptionChange={onChangeSortBy}
              />
            </div>
            <div className={css.filterLabelWrapper}></div>
          </div>
          <div className={css.resultWrapper}>
            <ResultList
              className={css.resultList}
              restaurants={restaurantInPage}
              isLoading={searchInProgress}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookerSelectRestaurant;
