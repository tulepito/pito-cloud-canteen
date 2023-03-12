import type { ChangeEventHandler } from 'react';
import { useMemo } from 'react';
import { useField, useForm } from 'react-final-form-hooks';
import { FormattedMessage, useIntl } from 'react-intl';

import Button from '@components/Button/Button';
import { IconCheckbox } from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import NamedLink from '@components/NamedLink/NamedLink';

import css from './AccessForm.module.scss';

type TAccessFormProps = {
  onSubmit: (values: TAccessFormValues) => void;
  initialValues?: TAccessFormValues;
  loading?: boolean;
  groupList?: any[];
  companyId?: string;
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
  loading,
  groupList = [],
  companyId,
}) => {
  const { form, handleSubmit, submitting, hasValidationErrors, pristine } =
    useForm<TAccessFormValues>({
      onSubmit,
      validate,
      initialValues,
    });

  const intl = useIntl();

  const selectedGroups = useField('selectedGroups', form);
  const submitInprogress = loading || submitting;
  const disabledSubmit = pristine || submitting || hasValidationErrors;

  const finalizeGroupList = useMemo(() => {
    return [
      {
        id: 'allMembers',
        name: 'Tất cả nhóm',
      },
      ...groupList,
    ];
  }, [groupList]);

  const handleChangeCheckboxGroup: (data: {
    id: string;
    name: string;
  }) => ChangeEventHandler<HTMLInputElement> = (data: any) => (e) => {
    if (e.target.checked) {
      form.change(
        'selectedGroups',
        (Array.isArray(selectedGroups.input.value)
          ? Array.from(new Set([...selectedGroups.input.value, data.id]))
          : [data.id]) as any,
      );
    } else {
      form.change(
        'selectedGroups',
        (Array.isArray(selectedGroups.input.value)
          ? selectedGroups.input.value.filter((item) => item !== data.id)
          : []) as any,
      );
    }
  };

  return (
    <form className={css.root} onSubmit={handleSubmit}>
      <div className={css.note}>
        {intl.formatMessage({
          id: 'Booker.CreateOrder.Form.group.scrollDownNote',
        })}
      </div>
      <div className={css.fieldGroups}>
        {finalizeGroupList.length === 0 && (
          <div className={css.emptyGroups}>
            {intl.formatMessage({
              id: 'Booker.CreateOrder.Form.field.emptyGroup',
            })}
          </div>
        )}
        {finalizeGroupList.map((data: any) => (
          <div className={css.checkboxItem} key={data.id}>
            <input
              className={css.input}
              id={`selectedGroups-${data.id}`}
              {...selectedGroups.input}
              onChange={handleChangeCheckboxGroup(data)}
              checked={(selectedGroups.input.value || []).includes(data.id)}
              type="checkbox"
              value={data.id}
            />
            <label className={css.label} htmlFor={`selectedGroups-${data.id}`}>
              <span className={css.checkboxWrapper}>
                <IconCheckbox
                  checkedClassName={css.checked}
                  boxClassName={css.box}
                />
              </span>
              <span className={css.labelText}>{data.name}</span>
            </label>
          </div>
        ))}
      </div>

      <NamedLink
        className={css.groupsSettings}
        path={`/company/${companyId}/group-setting`}
        target="_blank">
        {intl.formatMessage({
          id: 'Booker.CreateOrder.Form.field.groupsSettings',
        })}
      </NamedLink>

      <Button
        className={css.submitBtn}
        inProgress={submitInprogress}
        disabled={disabledSubmit}>
        <FormattedMessage id="Booker.CreateOrder.Form.saveChange" />
      </Button>
    </form>
  );
};

export default AccessForm;
