import { useEffect, useMemo } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';

import Form from '@components/Form/Form';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useBottomScroll } from '@hooks/useBottomScroll';
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

type TExtraProps = {
  formId: string;
  emptyFoodLabel: string;
  suitableFoodList: TListing[];
  setSelectedFoodIds: (value: any) => void;
  setPageCallBack: () => void;
};
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
    formId,
    suitableFoodList,
    values: { food: selectedFoodIds = [] },
    emptyFoodLabel,
    setSelectedFoodIds,
    setPageCallBack,
  } = props;

  const isEmptyFoodList = suitableFoodList?.length === 0;
  const foodOptions = useMemo(
    () =>
      suitableFoodList?.map((item: TListing) => {
        const foodId = Listing(item).getId();

        return { key: foodId, value: foodId, data: item };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(suitableFoodList)],
  );
  const rootFoodIds = generateIdsFromOptions(foodOptions!);

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

  useBottomScroll(setPageCallBack!);

  const handleScroll = (e: any) => {
    const bottom =
      Math.floor(e.target.scrollHeight - e.target.scrollTop) >=
      Math.floor(e.target.clientHeight);

    if (bottom && setPageCallBack) {
      setPageCallBack();
    }
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

    if (setSelectedFoodIds) setSelectedFoodIds(selectedFoodIds);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foodOptions?.length, JSON.stringify(selectedFoodIds)]);

  return (
    <Form
      id={formId}
      className={css.root}
      onSubmit={customHandleSubmit}
      onScroll={handleScroll}>
      <RenderWhen condition={!isEmptyFoodList}>
        <FieldFoodSelectAll
          id={`SelectFoodForMealForm.food.checkAll`}
          name="checkAll"
          customOnChange={handleCheckAllFieldChange}
        />
      </RenderWhen>
      <FieldFoodSelectCheckboxGroup
        name="food"
        options={foodOptions}
        emptyFoodLabel={emptyFoodLabel}
      />
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
