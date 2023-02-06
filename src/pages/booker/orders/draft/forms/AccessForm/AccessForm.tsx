import Button from '@components/Button/Button';
import { IconCheckbox } from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import type { ChangeEventHandler } from 'react';
import { useField, useForm } from 'react-final-form-hooks';
import { FormattedMessage, useIntl } from 'react-intl';

import css from './AccessForm.module.scss';

const GROUP_LIST = [
  {
    value: 'allGroup',
    label: 'Tất cả nhóm',
  },
  {
    value: 'group1',
    label: 'Nhóm 1',
  },
  {
    value: 'group2',
    label: 'Nhóm 2',
  },
];

type TAccessFormProps = {
  onSubmit: (values: TAccessFormValues) => void;
  initialValues?: TAccessFormValues;
};

export type TAccessFormValues = {
  selectedGroups: string;
};

const validate = (values: TAccessFormValues) => {
  const errors: any = {};
  if (!values.selectedGroups) {
    errors.selectedGroups = 'Required';
  }
  return errors;
};

const AccessForm: React.FC<TAccessFormProps> = ({
  onSubmit,
  initialValues,
}) => {
  const { form, handleSubmit, submitting, hasValidationErrors } =
    useForm<TAccessFormValues>({
      onSubmit,
      validate,
      initialValues,
    });

  const intl = useIntl();

  const selectedGroups = useField('selectedGroups', form);
  const disabledSubmit = submitting || hasValidationErrors;

  const handleChangeCheckboxGroup: (data: {
    value: string;
    label: string;
  }) => ChangeEventHandler<HTMLInputElement> = (data: any) => (e) => {
    if (e.target.checked) {
      form.change(
        'selectedGroups',
        (Array.isArray(selectedGroups.input.value)
          ? Array.from(new Set([...selectedGroups.input.value, data.value]))
          : [data.value]) as any,
      );
    } else {
      form.change(
        'selectedGroups',
        (Array.isArray(selectedGroups.input.value)
          ? selectedGroups.input.value.filter((item) => item !== data.value)
          : []) as any,
      );
    }
  };

  return (
    <form className={css.root} onSubmit={handleSubmit}>
      <div className={css.fieldGroups}>
        {GROUP_LIST.length === 0 && (
          <div className={css.emptyGroups}>
            {intl.formatMessage({
              id: 'Booker.CreateOrder.Form.field.emptyGroup',
            })}
          </div>
        )}
        {GROUP_LIST.map((data: any) => (
          <div className={css.checkboxItem} key={data.value}>
            <input
              className={css.input}
              id={`selectedGroups-${data.value}`}
              {...selectedGroups.input}
              onChange={handleChangeCheckboxGroup(data)}
              type="checkbox"
              value={data.value}
            />
            <label
              className={css.label}
              htmlFor={`selectedGroups-${data.value}`}>
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

      <div className={css.groupsSettings}>
        {intl.formatMessage({
          id: 'Booker.CreateOrder.Form.field.groupsSettings',
        })}
      </div>

      <Button className={css.submitBtn} disabled={disabledSubmit}>
        <FormattedMessage id="Booker.CreateOrder.Form.saveChange" />
      </Button>
    </form>
  );
};

export default AccessForm;
