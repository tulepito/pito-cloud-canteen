import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm, FormSpy } from 'react-final-form';
import classNames from 'classnames';
import { useRouter } from 'next/router';

import Form from '@components/Form/Form';
import { useAppSelector } from '@hooks/reduxHooks';
import { distanceOptions, ratingOptions } from '@src/marketplaceConfig';

import CollapseFilter from '../../../components/CollapseFilter/CollapseFilter';

import css from './FilterSidebarForm.module.scss';

export type TFilterSidebarFormValues = {};

type TExtraProps = {
  className?: string;
};
type TFilterSidebarFormComponentProps =
  FormRenderProps<TFilterSidebarFormValues> & Partial<TExtraProps>;
type TFilterSidebarFormProps = FormProps<TFilterSidebarFormValues> &
  TExtraProps;

const FilterSidebarFormComponent: React.FC<TFilterSidebarFormComponentProps> = (
  props,
) => {
  const { handleSubmit, form, className } = props;
  const router = useRouter();

  const menuTypesOptions = useAppSelector(
    (state) => state.SystemAttributes.menuTypes,
  );
  const categoriesOptions = useAppSelector(
    (state) => state.SystemAttributes.categories,
  );
  const packagingOptions = useAppSelector(
    (state) => state.SystemAttributes.packaging,
  );

  const onResetAllFilters = () => {
    form.reset({
      menuTypes: [],
      categories: [],
      distance: [],
      rating: [],
      packaging: [],
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

    if (JSON.stringify(newQuery) === JSON.stringify(router.query)) {
      return;
    }

    router.push({
      query: {
        ...newQuery,
      },
    });
  };

  const classes = classNames(css.root, className);

  return (
    <Form onSubmit={handleSubmit} className={classes}>
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
        <div className={css.filterWrapper}>
          <CollapseFilter
            title="Bao bì"
            name="packaging"
            options={packagingOptions}
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
