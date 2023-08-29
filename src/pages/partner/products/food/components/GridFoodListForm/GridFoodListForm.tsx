import { useEffect } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';

import Form from '@components/Form/Form';
import Pagination from '@components/Pagination/Pagination';
import type { TListing, TPagination } from '@src/utils/types';

import FoodCard from '../FoodCard/FoodCard';

import css from './GridFoodListForm.module.scss';

export type TGridFoodListFormValues = {
  foodId: string[];
};

type TExtraProps = {
  foodList: TListing[];
  pagination: TPagination;
  getGridFoodListFormValues: (values: string[]) => void;
  onPageChange: (page: number) => void;
  setFoodToRemove: (params: { id: string }) => void;
};
type TGridFoodListFormComponentProps =
  FormRenderProps<TGridFoodListFormValues> & Partial<TExtraProps>;
type TGridFoodListFormProps = FormProps<TGridFoodListFormValues> & TExtraProps;

const GridFoodListFormComponent: React.FC<TGridFoodListFormComponentProps> = (
  props,
) => {
  const {
    handleSubmit,
    foodList = [],
    values,
    getGridFoodListFormValues,
    pagination,
    onPageChange,
    setFoodToRemove,
  } = props;

  useEffect(() => {
    getGridFoodListFormValues?.(values.foodId || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values)]);

  return (
    <div>
      <Form onSubmit={handleSubmit} className={css.formWrapper}>
        {foodList.map((food) => (
          <FoodCard
            key={food.id.uuid}
            id={food.id.uuid}
            name="foodId"
            food={food}
            setFoodToRemove={setFoodToRemove!}
          />
        ))}
      </Form>
      <Pagination
        className={css.pagination}
        total={pagination?.totalItems}
        pageSize={pagination?.perPage}
        current={pagination?.page}
        onChange={onPageChange}
      />
    </div>
  );
};

const GridFoodListForm: React.FC<TGridFoodListFormProps> = (props) => {
  return <FinalForm {...props} component={GridFoodListFormComponent} />;
};

export default GridFoodListForm;
