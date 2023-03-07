import type { FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { companyThunks } from '@redux/slices/company.slice';

import css from './GroupInfoForm.module.scss';

type GroupInfoFormProps = {
  groupId: string;
  initialValues: any;
  onCallback: () => void;
};
const GroupInfoForm: React.FC<GroupInfoFormProps> = (props) => {
  const intl = useIntl();
  const { initialValues, onCallback, groupId } = props;
  const dispatch = useAppDispatch();
  const updateGroupInProgress = useAppSelector(
    (state) => state.company.updateGroupInProgress,
  );
  const onSubmit = (values: any) => {
    dispatch(
      companyThunks.updateGroup({
        groupInfo: {
          ...values,
        },
        groupId,
      }),
    ).then(() => onCallback());
  };
  return (
    <FinalForm
      initialValues={initialValues}
      onSubmit={onSubmit}
      render={(formRenderProps: FormRenderProps) => {
        const { handleSubmit, pristine } = formRenderProps;
        return (
          <Form className={css.formContainer} onSubmit={handleSubmit}>
            <div className={css.fieldWrapper}>
              <FieldTextInput
                id="GroupInfo-GroupName"
                name="name"
                label={intl.formatMessage({ id: 'GroupInfoForm.name' })}
                labelClassName={css.label}
                className={css.groupNameField}
              />
              <FieldTextInput
                id="GroupInfo-GroupDescription"
                name="description"
                label={intl.formatMessage({ id: 'GroupInfoForm.description' })}
                labelClassName={css.label}
                className={css.descriptionField}
              />
            </div>
            <div className={css.buttonsWrapper}>
              <Button
                className={css.cancelBtn}
                type="button"
                onClick={onCallback}>
                {intl.formatMessage({ id: 'GroupInfoForm.cancel' })}
              </Button>
              <Button
                disabled={pristine}
                type="submit"
                inProgress={updateGroupInProgress}>
                {intl.formatMessage({ id: 'GroupInfoForm.saveChange' })}
              </Button>
            </div>
          </Form>
        );
      }}
    />
  );
};

export default GroupInfoForm;
