import type { ChangeEventHandler } from 'react';
import { useMemo } from 'react';
import { useField, useForm } from 'react-final-form-hooks';
import { FormattedMessage, useIntl } from 'react-intl';

import Button from '@components/Button/Button';
import { IconCheckbox } from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import NamedLink from '@components/NamedLink/NamedLink';
import { companyPaths } from '@src/paths';

import css from './AccessForm.module.scss';

type TAccessFormProps = {
  onSubmit: (values: TAccessFormValues) => void;
  initialValues?: TAccessFormValues;
  loading?: boolean;
  groupList?: any[];
  companyId?: string;
};

export type TAccessFormValues = {
  selectedGroups: string[];
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

  const isAllMembersSelected = (selectedGroups.input.value || []).includes(
    'allMembers',
  );

  const finalizeGroupList = useMemo(() => {
    return [
      {
        id: 'allMembers',
        name: 'Tất cả nhóm',
      },
      ...groupList,
    ];
  }, [groupList]);

  const handleChangeCheckboxButtonGroup: (data: {
    id: string;
    name: string;
  }) => ChangeEventHandler<HTMLInputElement> = (data) => (e) => {
    const current = selectedGroups.input.value || [];
    const isChecking = e.target.checked;

    if (data.id === 'allMembers') {
      form.change('selectedGroups', isChecking ? ['allMembers'] : []);

      return;
    }

    if (isChecking) {
      const withoutAll = current.filter((id: string) => id !== 'allMembers');
      form.change('selectedGroups', [...withoutAll, data.id]);
    } else {
      form.change(
        'selectedGroups',
        current.filter((id: string) => id !== data.id),
      );
    }
  };

  return (
    <form className={css.root} onSubmit={handleSubmit}>
      <div className={css.scrollContent}>
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
                onChange={handleChangeCheckboxButtonGroup(data)}
                checked={(selectedGroups.input.value || []).includes(data.id)}
                type="checkbox"
                value={data.id}
                disabled={data.id !== 'allMembers' && isAllMembersSelected}
              />
              <label
                className={css.label}
                htmlFor={`selectedGroups-${data.id}`}>
                <span className={css.checkboxWrapper}>
                  <IconCheckbox checkedClassName={css.checked} />
                </span>
                <span className={css.labelText}>{data.name}</span>
              </label>
            </div>
          ))}
        </div>

        <NamedLink
          className={css.groupsSettings}
          path={companyPaths.GroupSetting}
          params={{ companyId: companyId! }}
          target="_blank">
          {intl.formatMessage({
            id: 'Booker.CreateOrder.Form.field.groupsSettings',
          })}
        </NamedLink>
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

export default AccessForm;
