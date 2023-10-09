import { useEffect } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import classNames from 'classnames';

import Form from '@components/Form/Form';
import FieldCheckbox from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import type { TListing, TPagination } from '@src/utils/types';

import FoodRow from '../FoodRow/FoodRow';

import css from './RowFoodListForm.module.scss';

export type TRowFoodListFormValues = {
  foodId: string[];
};

type TExtraProps = {
  foodList: TListing[];
  pagination: TPagination;
  isFoodAcceptedTab: boolean;
  getGridFoodListFormValues: (values: string[]) => void;
  onPageChange: (page: number) => void;
  setFoodToRemove: (params: { id: string }) => void;
  setSelectedFood: (food: TListing) => void;
  openManipulateFoodModal: () => void;
};
type TRowFoodListFormComponentProps = FormRenderProps<TRowFoodListFormValues> &
  Partial<TExtraProps>;
type TRowFoodListFormProps = FormProps<TRowFoodListFormValues> & TExtraProps;

const RowFoodListFormComponent: React.FC<TRowFoodListFormComponentProps> = (
  props,
) => {
  const {
    handleSubmit,
    foodList = [],
    values,
    getGridFoodListFormValues,
    setFoodToRemove,
    setSelectedFood,
    openManipulateFoodModal,
    form,
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
        <FoodRow
          key={food.id.uuid}
          id={food.id.uuid}
          name="foodId"
          food={food}
          setFoodToRemove={setFoodToRemove!}
          setSelectedFood={setSelectedFood!}
          openManipulateFoodModal={openManipulateFoodModal!}
          isFoodAcceptedTab={isFoodAcceptedTab!}
        />
      ))}
    </Form>
  );
};

const RowFoodListForm: React.FC<TRowFoodListFormProps> = (props) => {
  return <FinalForm {...props} component={RowFoodListFormComponent} />;
};

export default RowFoodListForm;
