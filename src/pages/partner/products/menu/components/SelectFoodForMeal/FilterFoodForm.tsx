/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';

import Form from '@components/Form/Form';
import FieldDatePicker from '@components/FormFields/FieldDatePicker/FieldDatePicker';
import FieldRadioButton from '@components/FormFields/FieldRadioButton/FieldRadioButton';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import { EFoodTypes, FOOD_TYPE_OPTIONS, getLabelByKey } from '@src/utils/enums';
import {
  composeValidators,
  minPriceLength,
  parsePrice,
} from '@src/utils/validators';

import css from './FilterFoodForm.module.scss';

export type TFilterFormValues = {
  foodType?: string;
  createAtStart?: number;
  createAtEnd?: number;
  startPrice?: string;
  endPrice?: string;
};

type TExtraProps = {
  setFilterValues: (values: any) => void;
  setShouldClearForm: (value: boolean) => void;
  shouldClearForm: boolean;
  setValidState: (value: boolean) => void;
};
type TFilterFormComponentProps = FormRenderProps<TFilterFormValues> &
  Partial<TExtraProps>;
type TFilterFormProps = FormProps<TFilterFormValues> & TExtraProps;

const FilterFormComponent: React.FC<TFilterFormComponentProps> = (props) => {
  const {
    handleSubmit,
    values,
    form,
    shouldClearForm,
    setShouldClearForm,
    setFilterValues,
    setValidState,
    valid,
  } = props;
  const {
    createAtStart: createAtStartInitialValue,
    createAtEnd: createAtEndInitialValue,
  } = values;
  const initialCreateAtStart = createAtStartInitialValue
    ? new Date(createAtStartInitialValue)
    : null;

  const initialCreateAtEnd = createAtEndInitialValue
    ? new Date(createAtEndInitialValue)
    : null;
  const [startDate, setStartDate] = useState<Date>(initialCreateAtStart!);
  const [endDate, setEndDate] = useState<Date>(initialCreateAtEnd!);

  const maxEndDate = new Date();

  const handleStartDateChange = (date: Date) => {
    setStartDate(date);

    if (endDate !== null && date > endDate) {
      setEndDate(null!);
      form.change('createAtEnd', null!);
    }
  };

  const handleEndDateChange = (date: Date) => {
    setEndDate(date);
  };

  useEffect(() => {
    if (setFilterValues) setFilterValues(values);
  }, [JSON.stringify(values)]);
  useEffect(() => {
    if (setValidState) setValidState(valid);
  }, [valid]);
  useEffect(() => {
    if (shouldClearForm) form.reset();
    if (setShouldClearForm) setShouldClearForm(false);
  }, [shouldClearForm]);

  return (
    <Form onSubmit={handleSubmit} className={css.formContainer}>
      <div>
        <div className={css.label}>Đơn giá</div>
        <div className={css.dateInputGroup}>
          <FieldTextInput
            name="startPrice"
            id="startPrice"
            placeholder={'Từ'}
            inputClassName={css.inputWithSuffix}
            rightIcon={
              <div>
                <div className={css.inputSuffixed}>đ</div>{' '}
              </div>
            }
            parse={parsePrice}
          />
          <FieldTextInput
            name="endPrice"
            id="endPrice"
            placeholder={'Đến'}
            inputClassName={css.inputWithSuffix}
            rightIcon={
              <div>
                <div className={css.inputSuffixed}>đ</div>
              </div>
            }
            validate={composeValidators(
              values.startPrice
                ? minPriceLength(
                    `Đơn giá phải lớn hơn ${values.startPrice}`,
                    Number(values.startPrice?.toString().split('.').join('')),
                  )
                : (_: number) => undefined,
            )}
            parse={parsePrice}
          />
        </div>
      </div>

      <div>
        <div className={css.label}>Loại món</div>
        <FieldRadioButton
          name="foodType"
          id={`foodType-${EFoodTypes.vegetarianDish}`}
          value={EFoodTypes.vegetarianDish}
          label={getLabelByKey(FOOD_TYPE_OPTIONS, EFoodTypes.vegetarianDish)}
        />
        <FieldRadioButton
          name="foodType"
          id={`foodType-${EFoodTypes.savoryDish}`}
          value={EFoodTypes.savoryDish}
          label={getLabelByKey(FOOD_TYPE_OPTIONS, EFoodTypes.savoryDish)}
        />
      </div>

      <div>
        <div className={css.label}>Ngày tải món ăn</div>
        <div className={css.dateInputGroup}>
          <FieldDatePicker
            id="createAtStart"
            name="createAtStart"
            selected={startDate}
            onChange={handleStartDateChange}
            autoComplete="off"
            dateFormat={'EEE, dd MMMM, yyyy'}
            placeholderText="Từ"
            maxDate={maxEndDate}
          />
          <FieldDatePicker
            id="createAtEnd"
            name="createAtEnd"
            onChange={handleEndDateChange}
            selected={endDate}
            minDate={startDate}
            maxDate={maxEndDate}
            dateFormat={'EEE, dd MMMM, yyyy'}
            autoComplete="off"
            disabled={!startDate}
            placeholderText="Đến"
          />
        </div>
      </div>
    </Form>
  );
};

const FilterForm: React.FC<TFilterFormProps> = (props) => {
  return <FinalForm {...props} component={FilterFormComponent} />;
};

export default FilterForm;
