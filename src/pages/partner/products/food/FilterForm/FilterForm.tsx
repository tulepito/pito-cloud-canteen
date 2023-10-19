import { useState } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldDatePicker from '@components/FormFields/FieldDatePicker/FieldDatePicker';
import FieldRadioButton from '@components/FormFields/FieldRadioButton/FieldRadioButton';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import { EFoodType } from '@src/utils/enums';
import { FOOD_TYPE_OPTIONS, getLabelByKey } from '@src/utils/options';

import css from './FilterForm.module.scss';

export type TFilterFormValues = {
  keywords?: string | string[];
  foodType?: string;
  createAtStart?: number;
  createAtEnd?: number;
};

type TExtraProps = {
  categoryOptions: any;
  onClearForm: () => void;
};
type TFilterFormComponentProps = FormRenderProps<TFilterFormValues> &
  Partial<TExtraProps>;
type TFilterFormProps = FormProps<TFilterFormValues> & TExtraProps;

const FilterFormComponent: React.FC<TFilterFormComponentProps> = (props) => {
  const { handleSubmit, onClearForm, values, form } = props;
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
  const intl = useIntl();
  const submitDisabled = false;
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

  return (
    <Form onSubmit={handleSubmit} className={css.formContainer}>
      <FieldTextInput
        name="keywords"
        id="keywords"
        label="Tên món"
        labelClassName={css.label}
        placeholder="Nhập tên món"
        className={css.input}
      />

      {/* <FieldMultipleSelect
        className={css.input}
        name="pub_category"
        id="pub_category"
        label="Phong cách ẩm thực"
        placeholder="Phong cách ẩm thực"
        options={categoryOptions}
      /> */}
      <div>
        <div className={css.label}>Loại món</div>
        <FieldRadioButton
          name="foodType"
          id={`foodType-${EFoodType.vegetarianDish}`}
          value={EFoodType.vegetarianDish}
          label={getLabelByKey(FOOD_TYPE_OPTIONS, EFoodType.vegetarianDish)}
        />
        <FieldRadioButton
          name="foodType"
          id={`foodType-${EFoodType.savoryDish}`}
          value={EFoodType.savoryDish}
          label={getLabelByKey(FOOD_TYPE_OPTIONS, EFoodType.savoryDish)}
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
      <div className={css.btns}>
        <Button
          type="button"
          className={css.filterBtn}
          size="medium"
          variant="secondary"
          disabled={submitDisabled}
          onClick={onClearForm}>
          {intl.formatMessage({ id: 'IntegrationFilterModal.clearBtn' })}
        </Button>

        <Button
          type="submit"
          className={css.filterBtn}
          size="medium"
          disabled={submitDisabled}>
          {intl.formatMessage({ id: 'ManagePartnerFoods.filterModal.title' })}
        </Button>
      </div>
    </Form>
  );
};

const FilterForm: React.FC<TFilterFormProps> = (props) => {
  return <FinalForm {...props} component={FilterFormComponent} />;
};

export default FilterForm;
