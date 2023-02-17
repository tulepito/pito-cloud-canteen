import type { TFilterSidebarFormValues } from '../FilterSidebarForm/FilterSidebarForm';
import FilterSidebarForm from '../FilterSidebarForm/FilterSidebarForm';
import css from './FilterSidebar.module.scss';

type TFilterSidebarProps = {
  initialValues?: TFilterSidebarFormValues;
};
const FilterSidebar: React.FC<TFilterSidebarProps> = ({
  initialValues = {},
}) => {
  return (
    <div className={css.container}>
      <FilterSidebarForm onSubmit={() => {}} initialValues={initialValues} />
    </div>
  );
};

export default FilterSidebar;
