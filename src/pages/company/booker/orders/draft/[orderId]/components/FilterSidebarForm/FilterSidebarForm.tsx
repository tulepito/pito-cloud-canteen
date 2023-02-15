import Form from '@components/Form/Form';
import { useAppSelector } from '@hooks/reduxHooks';
import { distanceOptions, ratingOptions } from '@src/marketplaceConfig';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';

import CollapseFilter from '../CollapseFilter/CollapseFilter';
import css from './FilterSidebarForm.module.scss';

export type TFilterSidebarFormValues = {};

type TExtraProps = {};
type TFilterSidebarFormComponentProps =
  FormRenderProps<TFilterSidebarFormValues> & Partial<TExtraProps>;
type TFilterSidebarFormProps = FormProps<TFilterSidebarFormValues> &
  TExtraProps;

const FilterSidebarFormComponent: React.FC<TFilterSidebarFormComponentProps> = (
  props,
) => {
  const { handleSubmit, initialValues, form } = props;
  const menuTypesOptions = useAppSelector(
    (state) => state.SearchFilter.menuTypes,
  );
  const mealTypesOptions = useAppSelector(
    (state) => state.SearchFilter.mealTypes,
  );

  const onResetAllFilters = () => {
    form.reset(initialValues);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div className={css.header}>
        <div className={css.title}>Bộ lọc</div>
        <div className={css.removeFilters} onClick={onResetAllFilters}>
          Xoá tất cả bộ lọc
        </div>
      </div>
      <div className={css.filtersContainer}>
        <div className={css.filterWrapper}>
          <CollapseFilter
            title="Loại menu"
            name="menuTypes"
            options={menuTypesOptions}
          />
        </div>
        <div className={css.filterWrapper}>
          <CollapseFilter
            title="Loại ấm thực"
            name="mealTypes"
            options={mealTypesOptions}
          />
        </div>
        <div className={css.filterWrapper}>
          <CollapseFilter
            title="Khoảng cách"
            name="distance"
            options={distanceOptions}
          />
        </div>
        <div className={css.filterWrapper}>
          <CollapseFilter
            title="Đánh giá"
            name="rating"
            options={ratingOptions}
          />
        </div>
      </div>
    </Form>
  );
};

const FilterSidebarForm: React.FC<TFilterSidebarFormProps> = (props) => {
  return <FinalForm {...props} component={FilterSidebarFormComponent} />;
};

export default FilterSidebarForm;
