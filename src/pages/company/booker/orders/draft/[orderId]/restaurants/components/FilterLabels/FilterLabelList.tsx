import { useCallback, useMemo } from 'react';
import { shallowEqual } from 'react-redux';
import { useRouter } from 'next/router';

import IconClose from '@components/Icons/IconClose/IconClose';
import { useAppSelector } from '@hooks/reduxHooks';
import { distanceOptions, ratingOptions } from '@src/marketplaceConfig';
import type { TKeyValue } from '@src/utils/types';

import { convertQueryValueToArray } from '../../helpers/urlQuery';

import css from './FilterLabelsSection.module.scss';

const FilterLabelList: React.FC = () => {
  const router = useRouter();
  const menuTypesOptions = useAppSelector(
    (state) => state.SystemAttributes.menuTypes,
    shallowEqual,
  );
  const categoriesOptions = useAppSelector(
    (state) => state.SystemAttributes.categories,
    shallowEqual,
  );
  const packagingOptions = useAppSelector(
    (state) => state.SystemAttributes.packaging,
    shallowEqual,
  );

  const { menuTypes, categories, distance, rating, packaging } = router.query;

  const filterLabels = useMemo(
    () => [
      ...convertQueryValueToArray(menuTypes).map((menuType: string) => {
        return {
          filter: 'menuTypes',
          label: menuTypesOptions.find(
            (option: TKeyValue) => option.key === menuType,
          )?.label,
          value: menuType,
        };
      }),
      ...convertQueryValueToArray(categories).map((category: string) => {
        return {
          filter: 'categories',
          label: categoriesOptions.find(
            (option: TKeyValue) => option.key === category,
          )?.label,
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
      ...convertQueryValueToArray(packaging).map((_packaging: string) => {
        return {
          filter: 'packaging',
          label: packagingOptions.find(
            (option: TKeyValue) => option.key === _packaging,
          )?.label,
          value: _packaging,
        };
      }),
    ],
    [
      menuTypes,
      categories,
      distance,
      rating,
      packaging,
      menuTypesOptions,
      categoriesOptions,
      packagingOptions,
    ],
  );

  const onFilterLabelRemove = useCallback(
    (filter: string, value: string) => {
      const newQuery = { ...router.query };
      newQuery[filter] = convertQueryValueToArray(newQuery[filter])
        .filter((item: string) => item !== value)
        .join(',');

      router.push({
        query: {
          ...newQuery,
        },
      });
    },
    [router],
  );

  return (
    <div className={css.container}>
      {filterLabels.map(({ filter, value, label }) => (
        <div key={`${filter}-${value}-${label}`} className={css.filterLabel}>
          <span>{label}</span>
          <IconClose
            className={css.closeIcon}
            onClick={onFilterLabelRemove?.bind(null, filter, value)}
          />
        </div>
      ))}
    </div>
  );
};

export default FilterLabelList;
