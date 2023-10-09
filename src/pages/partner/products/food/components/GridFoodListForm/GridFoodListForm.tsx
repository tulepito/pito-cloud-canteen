import { useEffect } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import classNames from 'classnames';

import Form from '@components/Form/Form';
import FieldCheckbox from '@components/FormFields/FieldCheckbox/FieldCheckbox';
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
  editableFoodMap: Record<string, boolean>;
  deletableFoodMap: Record<string, boolean>;
  isFoodAcceptedTab: boolean;
  getGridFoodListFormValues: (values: string[]) => void;
  onPageChange: (page: number) => void;
  setFoodToRemove: (params: { id: string }) => void;
  setSelectedFood: (food: TListing) => void;
  openManipulateFoodModal: () => void;
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
    setSelectedFood,
    openManipulateFoodModal,
    form,
    editableFoodMap,
    deletableFoodMap,
    isFoodAcceptedTab,
  } = props;

  const onCheckAllChange = (event: any) => {
    const { checked, value, name } = event.target;

    let newValues = [...foodList.map((_food) => _food.id.uuid)];
    if (!checked) {
      newValues = [];
      form.change(name, []);
    } else {
      form.change(name, [value]);
      newValues = [...foodList.map((_food) => _food.id.uuid)];
    }
    form.change('foodId', newValues);
  };

  useEffect(() => {
    getGridFoodListFormValues?.(values.foodId || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values)]);

  return (
    <div>
      <Form onSubmit={handleSubmit} className={css.formWrapper}>
        <FieldCheckbox
          id="foodId-all"
          name="foodId-all"
          value="all"
          label="Chọn tất cả"
          className={classNames(css.fieldInput, css.selectAll)}
          customOnChange={onCheckAllChange}
        />
        {foodList.map((food) => (
          <FoodCard
            key={food.id.uuid}
            id={food.id.uuid}
            name="foodId"
            food={food}
            setFoodToRemove={setFoodToRemove!}
            setSelectedFood={setSelectedFood!}
            openManipulateFoodModal={openManipulateFoodModal!}
            editableFoodMap={editableFoodMap!}
            deletableFoodMap={deletableFoodMap!}
            isFoodAcceptedTab={isFoodAcceptedTab!}
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
