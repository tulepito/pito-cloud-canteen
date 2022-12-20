import Button from '@components/Button/Button';
import FieldTextInput from '@components/FieldTextInput/FieldTextInput';
import Form from '@components/Form/Form';
import { useAppDispatch, useAppSelector } from '@redux/reduxHooks';
import { BookerManageCompany } from '@redux/slices/company.slice';
import type { FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';

import css from './GroupInfoForm.module.scss';

type GroupInfoFormProps = {
  groupId: string;
  initialValues: any;
  onCallback: () => void;
};
const GroupInfoForm: React.FC<GroupInfoFormProps> = (props) => {
  const { initialValues, onCallback, groupId } = props;
  const dispatch = useAppDispatch();
  const updateGroupInProgress = useAppSelector(
    (state) => state.company.updateGroupInProgress,
  );
  const onSubmit = (values: any) => {
    dispatch(
      BookerManageCompany.updateGroup({
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
                label="Ten nhom"
                labelClassName={css.label}
                className={css.groupNameField}
              />
              <FieldTextInput
                id="GroupInfo-GroupDescription"
                name="description"
                label="Mo ta"
                labelClassName={css.label}
                className={css.descriptionField}
              />
            </div>
            <Button
              disabled={pristine}
              type="submit"
              inProgress={updateGroupInProgress}>
              Luu thay doi
            </Button>
          </Form>
        );
      }}
    />
  );
};

export default GroupInfoForm;
