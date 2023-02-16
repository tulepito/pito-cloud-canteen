import Form from '@components/Form/Form';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { SearchFilterThunks } from '@redux/slices/SearchFilter.slice';
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
  const { handleSubmit, initialValues, form } = props;
  const router = useRouter();
  const { timestamp, orderId, page = 1 } = router.query;

  const dispatch = useAppDispatch();
  const menuTypesOptions = useAppSelector(
    (state) => state.SearchFilter.menuTypes,
  );
  const categoriesOptions = useAppSelector(
    (state) => state.SearchFilter.categories,
  );

  const onResetAllFilters = () => {
    form.reset(initialValues);
  };
  const handleFormChange = async (values: any) => {
    const { values: formValues } = values;
    setTimeout(() => {
      dispatch(
        SearchFilterThunks.searchRestaurants({
          timestamp: parseInt(timestamp as string, 10),
          orderId,
          page: parseInt(page as string, 10),
          ...formValues,
        }),
      );
    }, 0);
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
