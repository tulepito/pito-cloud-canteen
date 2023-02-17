import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useFetchSearchFilters from '@hooks/useFetchSearchFilters';
import KeywordSearchForm from '@pages/admin/partner/components/KeywordSearchForm/KeywordSearchForm';
import { SearchFilterThunks } from '@redux/slices/SearchFilter.slice';
import { distanceOptions, ratingOptions } from '@src/marketplaceConfig';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import FilterSidebar from '../components/FilterSidebar/FilterSidebar';
import { useLoadData } from '../hooks/loadData';
import css from './BookerSelectRestaurant.module.scss';
import FilterLabelList from './components/FilterLabelList/FilterLabelList';
import ResultList from './components/ResultList/ResultList';
import SortingDropdown from './components/SortingDropdown/SortingDropdown';

const convertQueryValueToArray = (value?: string | string[]) => {
  if (Array.isArray(value)) {
    return value;
  }
  if (!value) {
    return [];
  }
  return value.split(',');
};

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
        ...(menuTypes
          ? { menuTypes: convertQueryValueToArray(menuTypes) }
          : {}),
        ...(categories
          ? { categories: convertQueryValueToArray(categories) }
          : {}),
        ...(distance ? { distance: convertQueryValueToArray(distance) } : {}),
        ...(rating ? { rating: convertQueryValueToArray(rating) } : {}),
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

  const menuTypesOptions = useAppSelector(
    (state) => state.SearchFilter.menuTypes,
    shallowEqual,
  );

  const categoriesOptions = useAppSelector(
    (state) => state.SearchFilter.categories,
    shallowEqual,
  );

  const totalResultItems = useAppSelector(
    (state) => state.SearchFilter.totalItems,
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
      menuTypes: convertQueryValueToArray(menuTypes),
      categories: convertQueryValueToArray(categories),
      distance: convertQueryValueToArray(distance),
      rating: convertQueryValueToArray(rating),
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

  const filterLabels = useMemo(
    () => [
      ...convertQueryValueToArray(menuTypes).map((menuType: string) => {
        return {
          filter: 'menuTypes',
          label: menuTypesOptions.find((option) => option.key === menuType)
            ?.label,
          value: menuType,
        };
      }),
      ...convertQueryValueToArray(categories).map((category: string) => {
        return {
          filter: 'categories',
          label: categoriesOptions.find((option) => option.key === category)
            ?.label,
          value: category,
        };
      }),
      ...convertQueryValueToArray(distance).map((_distance: string) => {
        return {
          filter: 'distance',
          label: distanceOptions.find((option) => option.key === _distance)
            ?.label,
          value: _distance,
        };
      }),
      ...convertQueryValueToArray(rating).map((_rating: string) => {
        return {
          filter: 'rating',
          label: ratingOptions.find((option) => option.key === _rating)?.label,
          value: _rating,
        };
      }),
    ],
    [
      menuTypes,
      categories,
      distance,
      rating,
      menuTypesOptions,
      categoriesOptions,
    ],
  );

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

  const onFilterLabelRemove = (filter: string, value: string) => {
    const newQuery = { ...router.query };
    newQuery[filter] = convertQueryValueToArray(newQuery[filter])
      .filter((item: string) => item !== value)
      .join(',');

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
            <div className={css.filterLabelWrapper}>
              <div className={css.resultNumber}>
                {intl.formatMessage(
                  { id: 'BookerSelectRestaurant.resultNumber' },
                  { totalResultItems },
                )}
              </div>
              <FilterLabelList
                filterLabels={filterLabels}
                onFilterLabelRemove={onFilterLabelRemove}
              />
            </div>
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
