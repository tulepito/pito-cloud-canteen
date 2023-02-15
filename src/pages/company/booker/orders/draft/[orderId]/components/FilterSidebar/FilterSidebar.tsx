import FilterSidebarForm from '../FilterSidebarForm/FilterSidebarForm';
import css from './FilterSidebar.module.scss';

const FilterSidebar = () => {
  return (
    <div className={css.container}>
      <FilterSidebarForm onSubmit={() => {}} initialValues={{}} />
    </div>
  );
};

export default FilterSidebar;
