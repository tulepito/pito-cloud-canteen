import { useEffect, useMemo } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { shallowEqual } from 'react-redux';
import arrayMutators from 'final-form-arrays';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppSelector } from '@hooks/reduxHooks';
import { Listing } from '@src/utils/data';
import type { TListing } from '@src/utils/types';

import FieldFoodSelectAll from './FieldFoodSelectAll';
import FieldFoodSelectCheckboxGroup from './FieldFoodSelectCheckboxGroup';

import css from './SelectFoodForMealForm.module.scss';

const DELAY_UPDATE_TIME = 300;
const generateIdsFromOptions = (options: any[]) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMemo(() => options.map((item) => item.key), [options]);
};

export type TSelectFoodForMealFormValues = {
  food: string[];
  checkAll: boolean;
};

type TExtraProps = {};
type TSelectFoodForMealFormComponentProps =
  FormRenderProps<TSelectFoodForMealFormValues> & Partial<TExtraProps>;
type TSelectFoodForMealFormProps = FormProps<TSelectFoodForMealFormValues> &
  TExtraProps;

const SelectFoodForMealFormComponent: React.FC<
  TSelectFoodForMealFormComponentProps
> = (props) => {
  const {
    form,
    handleSubmit,
    values: { food: selectedFoodIds = [] },
  } = props;
  const foods = useAppSelector((state) => state.foods.foods, shallowEqual);

  const isEmptyFoodList = foods?.length === 0;
  const foodOptions = useMemo(
    () =>
      foods?.map((item: TListing) => {
        const foodId = Listing(item).getId();

        return { key: foodId, value: foodId, data: item };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(foods)],
  );
  const rootFoodIds = generateIdsFromOptions(foodOptions);

  const customHandleSubmit = (event: any) => {
    event.preventDefault();

    return handleSubmit(event);
  };

  const handleCheckAllFieldChange = (event: any) => {
    let newFoodList: string[] = [];
    const newCheckAllValue = event.target.checked;

    form.change('checkAll', newCheckAllValue);

    if (newCheckAllValue) {
      newFoodList = rootFoodIds;
    } else {
      newFoodList = [];
    }

    setTimeout(() => form.change('food', newFoodList), DELAY_UPDATE_TIME);
  };

  useEffect(() => {
    if (
      foodOptions?.length === 0 ||
      selectedFoodIds?.length === 0 ||
      foodOptions?.length !== selectedFoodIds?.length
    ) {
      form.change('checkAll', false);
    } else {
      form.change('checkAll', true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foodOptions.length, JSON.stringify(selectedFoodIds)]);

  return (
    <Form className={css.root} onSubmit={customHandleSubmit}>
      <FieldFoodSelectAll
        id={`SelectFoodForMealForm.food.checkAll`}
        name="checkAll"
        customOnChange={handleCheckAllFieldChange}
      />
      <FieldFoodSelectCheckboxGroup name="food" options={foodOptions} />

      <RenderWhen condition={isEmptyFoodList}>
        <Button className={css.submitButton} type="submit">
          Thêm món ăn
        </Button>
        <RenderWhen.False>
          <Button className={css.submitButton} type="submit">
            Chọn món
          </Button>
        </RenderWhen.False>
      </RenderWhen>
    </Form>
  );
};

const SelectFoodForMealForm: React.FC<TSelectFoodForMealFormProps> = (
  props,
) => {
  return (
    <FinalForm
      mutators={{ ...arrayMutators }}
      {...props}
      component={SelectFoodForMealFormComponent}
    />
  );
};

export default SelectFoodForMealForm;
