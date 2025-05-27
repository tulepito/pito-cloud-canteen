import type { ChangeEventHandler } from 'react';
import { useField, useForm } from 'react-final-form-hooks';
import { FormattedMessage, useIntl } from 'react-intl';

import Button from '@components/Button/Button';
import { IconCheckbox } from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppSelector } from '@hooks/reduxHooks';
import { useFoodTypeOptionsByLocale } from '@src/utils/options';

import css from './NutritionForm.module.scss';

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
  const { form, handleSubmit, submitting, hasValidationErrors, pristine } =
    useForm<TNutritionFormValues>({
      onSubmit,
      initialValues,
    });

  const intl = useIntl();
  const FOOD_TYPE_OPTIONS = useFoodTypeOptionsByLocale();
  const nutritionsOptions =
    useAppSelector((state) => state.SystemAttributes.nutritions) || [];

  const nutritions = useField('nutritions', form);
  const mealType = useField('mealType', form);
  const submitInprogress = loading || submitting;
  const disabledSubmit = pristine || submitInprogress || hasValidationErrors;

  const handleChangeCheckboxGroup: (
    data: {
      value: string;
      label: string;
    },
    inputField: any,
  ) => ChangeEventHandler<HTMLInputElement> =
    (data: any, inputField: any) => (e) => {
      if (e.target.checked) {
        form.change(
          inputField.input.name,
          (Array.isArray(inputField.input.value)
            ? Array.from(new Set([...inputField.input.value, data.key]))
            : [data.key]) as any,
        );
      } else {
        form.change(
          inputField.input.name,
          (Array.isArray(inputField.input.value)
            ? inputField.input.value.filter((item: string) => item !== data.key)
            : []) as any,
        );
      }
    };

  return (
    <form className={css.root} onSubmit={handleSubmit}>
      <div className={css.scrollContent}>
        <div className={css.fieldGroups}>
          <div className={css.groupLabel}>
            <span>
              {intl.formatMessage({
                id: 'Booker.CreateOrder.Form.field.mealType',
              })}
            </span>
          </div>
          {FOOD_TYPE_OPTIONS.map((data: any) => (
            <div className={css.checkboxItem} key={data.key}>
              <input
                className={css.input}
                id={`mealType-${data.key}`}
                {...mealType.input}
                type="checkbox"
                onChange={handleChangeCheckboxGroup(data, mealType)}
                checked={(mealType.input.value || []).includes(data.key)}
                value={data.key}
              />
              <label className={css.label} htmlFor={`mealType-${data.key}`}>
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

        <RenderWhen condition={nutritionsOptions.length > 0}>
          <div className={css.fieldGroups}>
            <div className={css.groupLabel}>
              <span>
                {intl.formatMessage({
                  id: 'Booker.CreateOrder.Form.field.nutritions',
                })}
              </span>
            </div>
            {nutritionsOptions.map((data: any) => (
              <div className={css.checkboxItem} key={data.key}>
                <input
                  className={css.input}
                  id={`nutritions-${data.key}`}
                  {...nutritions.input}
                  onChange={handleChangeCheckboxGroup(data, nutritions)}
                  checked={(nutritions.input.value || []).includes(data.key)}
                  type="checkbox"
                  value={data.key}
                />
                <label className={css.label} htmlFor={`nutritions-${data.key}`}>
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
        </RenderWhen>
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
