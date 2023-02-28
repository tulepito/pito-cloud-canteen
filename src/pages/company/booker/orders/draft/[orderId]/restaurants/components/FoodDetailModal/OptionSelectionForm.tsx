import React from 'react';
import { useField, useForm } from 'react-final-form-hooks';

import css from './FoodDetailModal.module.scss';

type TOptionSelectionFormProps = {
  onSubmit: (values: TOptionSelectionFormValues) => void;
  initialValues?: TOptionSelectionFormValues;
};

type TOptionSelectionFormValues = {
  sizeOption?: string;
};

const OptionSelectionForm: React.FC<TOptionSelectionFormProps> = ({
  onSubmit,
  initialValues,
}) => {
  const { form } = useForm<TOptionSelectionFormValues>({
    onSubmit,
  });

  const sizeOptionField = useField('sizeOption', form);

  return (
    <form>
      <div className={css.optionSection}>
        <div className={css.categoryTitle}>
          <span className={css.title}>Chọn size</span>
          <span className={css.notice}>Bắt buộc, tối đa 1 món</span>
        </div>
        {[
          { key: 'sizeM', value: 'Size vừa' },
          { key: 'sizeL', value: 'Size lớn' },
        ].map((dish, index) => (
          <label
            key={index}
            className={css.radioLabel}
            htmlFor={`sizeOptionField-${index}`}>
            <input
              {...sizeOptionField.input}
              className={css.radioInput}
              type={'radio'}
              value={dish.key}
              defaultChecked={dish.key === initialValues?.sizeOption}
              id={`sizeOptionField-${index}`}
              name="sizeOptionField"
            />
            {dish.value}
          </label>
        ))}
      </div>
    </form>
  );
};

export default OptionSelectionForm;
