import type { ChangeEventHandler } from 'react';
import { useMemo } from 'react';
import { useField, useForm } from 'react-final-form-hooks';
import { FormattedMessage, useIntl } from 'react-intl';

import Button from '@components/Button/Button';
import { IconRadioButton } from '@components/FormFields/FieldRadioButton/FieldRadioButton';
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

  const finalizeGroupList = useMemo(() => {
    return [
      {
        id: 'allMembers',
        name: 'Tất cả nhóm',
      },
      ...groupList,
    ];
  }, [groupList]);

  const handleChangeRadioButtonGroup: (data: {
    id: string;
    name: string;
  }) => ChangeEventHandler<HTMLInputElement> = (data) => (e) => {
    const current: string[] = selectedGroups.input.value || [];
    const isChecking = e.target.checked;

    if (data.id === 'allMembers') {
      form.change('selectedGroups', isChecking ? ['allMembers'] : []);

      return;
    }

    const specificIds = groupList.map((g) => g.id);

    if (isChecking) {
      const withoutAll = current.filter((id: string) => id !== 'allMembers');
      const next = Array.from(new Set([...withoutAll, data.id]));

      const allSpecificSelected =
        specificIds.length > 0 &&
        specificIds.every((id: string) => next.includes(id));

      form.change(
        'selectedGroups',
        allSpecificSelected ? ['allMembers'] : next,
      );
    } else {
      const next = current.filter(
        (id: string) => id !== data.id && id !== 'allMembers',
      );
      form.change('selectedGroups', next);
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
                onChange={handleChangeRadioButtonGroup(data)}
                checked={(selectedGroups.input.value || []).includes(data.id)}
                type="checkbox"
                value={data.id}
              />
              <label
                className={css.label}
                htmlFor={`selectedGroups-${data.id}`}>
                <span className={css.checkboxWrapper}>
                  <IconRadioButton checkedClassName={css.checked} />
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
