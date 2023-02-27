import Form from '@components/Form/Form';
import { useAppSelector } from '@hooks/reduxHooks';
import { distanceOptions, ratingOptions } from '@src/marketplaceConfig';
import { useRouter } from 'next/router';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm, FormSpy } from 'react-final-form';

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
  const { handleSubmit, form } = props;
  const router = useRouter();

  const menuTypesOptions = useAppSelector(
    (state) => state.BookerSelectRestaurant.menuTypes,
  );
  const categoriesOptions = useAppSelector(
    (state) => state.BookerSelectRestaurant.categories,
  );

  const onResetAllFilters = () => {
    form.reset({
      menuTypes: [],
      categories: [],
      distance: [],
      rating: [],
    });
  };
  const handleFormChange = async (values: any) => {
    const { values: formValues } = values;
    const newQuery = { ...router.query };
    Object.keys(formValues).forEach((filter) => {
      if (formValues[filter].length === 0) {
        delete newQuery[filter];
      } else {
        newQuery[filter] = formValues[filter].join(',');
      }
    });

    router.push({
      query: {
        ...newQuery,
      },
    });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormSpy onChange={handleFormChange} subscription={{ values: true }} />
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
            name="categories"
            options={categoriesOptions}
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
