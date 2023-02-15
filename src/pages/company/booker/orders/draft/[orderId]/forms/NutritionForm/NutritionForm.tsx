import Button from '@components/Button/Button';
import { IconCheckbox } from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import type { ChangeEventHandler } from 'react';
import { useField, useForm } from 'react-final-form-hooks';
import { FormattedMessage, useIntl } from 'react-intl';

import css from './NutritionForm.module.scss';

const NUTRITION_LIST = [
  {
    value: 'anchay',
    label: 'Ăn chay',
  },
  {
    value: 'anItBeo',
    label: 'Ăn ít béo',
  },
];

type TNutritionFormProps = {
  onSubmit: (values: TNutritionFormValues) => void;
  initialValues?: TNutritionFormValues;
  loading?: boolean;
};

export type TNutritionFormValues = {
  nutritions: string;
};

const NutritionForm: React.FC<TNutritionFormProps> = ({
  onSubmit,
  initialValues,
  loading,
}) => {
  const { form, handleSubmit, submitting, hasValidationErrors } =
    useForm<TNutritionFormValues>({
      onSubmit,
      initialValues,
    });
  const intl = useIntl();

  const nutritions = useField('nutritions', form);
  const submitInprogress = loading || submitting;
  const disabledSubmit = submitInprogress || hasValidationErrors;

  const handleChangeCheckboxGroup: (data: {
    value: string;
    label: string;
  }) => ChangeEventHandler<HTMLInputElement> = (data: any) => (e) => {
    if (e.target.checked) {
      form.change(
        'nutritions',
        (Array.isArray(nutritions.input.value)
          ? Array.from(new Set([...nutritions.input.value, data.value]))
          : [data.value]) as any,
      );
    } else {
      form.change(
        'nutritions',
        (Array.isArray(nutritions.input.value)
          ? nutritions.input.value.filter((item) => item !== data.value)
          : []) as any,
      );
    }
  };

  return (
    <form className={css.root} onSubmit={handleSubmit}>
      <div className={css.fieldGroups}>
        <div className={css.groupLabel}>
          <span>
            {intl.formatMessage({
              id: 'Booker.CreateOrder.Form.field.nutritions',
            })}
          </span>
        </div>
        {NUTRITION_LIST.map((data: any) => (
          <div className={css.checkboxItem} key={data.value}>
            <input
              className={css.input}
              id={`nutritions-${data.value}`}
              {...nutritions.input}
              onChange={handleChangeCheckboxGroup(data)}
              checked={(nutritions.input.value || []).includes(data.value)}
              type="checkbox"
              value={data.value}
            />
            <label className={css.label} htmlFor={`nutritions-${data.value}`}>
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
        inProgress={submitInprogress}
        disabled={disabledSubmit}>
        <FormattedMessage id="Booker.CreateOrder.Form.saveChange" />
      </Button>
    </form>
  );
};

export default NutritionForm;
