import type { ChangeEventHandler } from 'react';
import { useField, useForm } from 'react-final-form-hooks';
import { FormattedMessage } from 'react-intl';

import Button, { InlineTextButton } from '@components/Button/Button';
import { IconCheckbox } from '@components/FormFields/FieldCheckbox/FieldCheckbox';

import css from './ApplyOtherDaysForm.module.scss';

type TApplyOtherDaysFormProps = {
  onSubmit: (values: TApplyOtherDaysFormValues) => void;
  onCancel: () => void;
  initialValues?: TApplyOtherDaysFormValues;
};

export type TApplyOtherDaysFormValues = {
  selectedDays: string[];
};

const validate = (values: TApplyOtherDaysFormValues) => {
  const errors: any = {};
  if (!values.selectedDays) {
    errors.selectedDays = 'Required';
  }
  return errors;
};

const ApplyOtherDaysForm: React.FC<TApplyOtherDaysFormProps> = ({
  onSubmit,
  onCancel,
  initialValues,
}) => {
  const { form, handleSubmit, submitting, hasValidationErrors } =
    useForm<TApplyOtherDaysFormValues>({
      onSubmit,
      validate,
      initialValues,
    });

  const selectedDays = useField('selectedDays', form);
  const disabledSubmit = submitting || hasValidationErrors;

  const handleChangeCheckboxGroup: (data: {
    value: string;
    label: string;
  }) => ChangeEventHandler<HTMLInputElement> = (data: any) => (e) => {
    if (e.target.checked) {
      form.change(
        'selectedDays',
        (Array.isArray(selectedDays.input.value)
          ? Array.from(new Set([...selectedDays.input.value, data.value]))
          : [data.value]) as any,
      );
    } else {
      form.change(
        'selectedDays',
        (Array.isArray(selectedDays.input.value)
          ? selectedDays.input.value.filter((item) => item !== data.value)
          : []) as any,
      );
    }
  };

  return (
    <form className={css.root} onSubmit={handleSubmit}>
      <div className={css.fieldGroups}>
        {[].map((data: any) => (
          <div className={css.checkboxItem} key={data.value}>
            <input
              className={css.input}
              id={`selectedDays-${data.value}`}
              {...selectedDays.input}
              onChange={handleChangeCheckboxGroup(data)}
              type="checkbox"
              value={data.value}
            />
            <label className={css.label} htmlFor={`selectedDays-${data.value}`}>
              <span className={css.checkboxWrapper}>
                <IconCheckbox
                  checkedClassName={css.checked}
                  boxClassName={css.box}
                />
              </span>
              <span className={css.labelText}>{data.label}</span>
            </label>
          </div>
        ))}
      </div>

      <Button
        className={css.submitBtn}
        type="submit"
        disabled={disabledSubmit}
        spinnerClassName={css.spinnerClassName}>
        <FormattedMessage id="CreateOrderForm.submit" />
      </Button>
      <InlineTextButton
        onClick={onCancel}
        className={css.cancelBtn}
        spinnerClassName={css.spinnerClassName}>
        <FormattedMessage id="CreateOrderForm.cancel" />
      </InlineTextButton>
    </form>
  );
};

export default ApplyOtherDaysForm;
