import { useRouter } from 'next/router';
import { useMemo } from 'react';

import { convertQueryValueToArray } from '../../helpers/urlQuery';
import FilterSidebarForm from '../FilterSidebarForm/FilterSidebarForm';
import css from './FilterSidebar.module.scss';

const FilterSidebar: React.FC = () => {
  const router = useRouter();

  const { menuTypes, categories, distance, rating } = router.query;

  const initialValues = useMemo(() => {
    return {
      menuTypes: convertQueryValueToArray(menuTypes),
      categories: convertQueryValueToArray(categories),
      distance: convertQueryValueToArray(distance),
      rating: convertQueryValueToArray(rating),
    };
  }, [categories, distance, menuTypes, rating]);

  return (
    <FilterSidebarForm
      className={css.container}
      onSubmit={() => {}}
      initialValues={initialValues}
    />
  );
};

export default FilterSidebar;
