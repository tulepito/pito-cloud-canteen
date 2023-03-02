import IconClose from '@components/Icons/IconClose/IconClose';
import useFetchSearchFilters from '@hooks/useFetchSearchFilters';
import { distanceOptions, ratingOptions } from '@src/marketplaceConfig';
import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';

import { convertQueryValueToArray } from '../../helpers/urlQuery';
import css from './FilterLabelsSection.module.scss';

const FilterLabelList: React.FC = () => {
  const router = useRouter();
  const { menuTypes, categories, distance, rating } = router.query;
  const { menuTypesOptions, categoriesOptions } = useFetchSearchFilters();

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
