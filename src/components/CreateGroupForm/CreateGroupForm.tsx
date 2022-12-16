import Button from '@components/Button/Button';
import FieldCheckbox from '@components/FieldCheckbox/FieldCheckbox';
import FieldTextInput from '@components/FieldTextInput/FieldTextInput';
import Form from '@components/Form/Form';
import { useAppDispatch, useAppSelector } from '@src/redux/reduxHooks';
import { createGroup } from '@src/redux/slices/company.slice';
import { required } from '@utils/validators';
import type { FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';

import css from './CreateGroupForm.module.scss';

type CreateGroupFormProps = {
  companyMembers: any[];
};
const CreateGroupForm: React.FC<CreateGroupFormProps> = ({
  companyMembers,
}) => {
  const dispatch = useAppDispatch();
  const createGroupInProgress = useAppSelector(
    (state) => state.company.createGroupInProgress,
  );
  const onSubmit = (values: Record<string, any>) => {
    const { groupName, members } = values;
    const groupMembers = companyMembers
      .filter((member) => members.includes(member.id.uuid))
      .map((member) => ({
        id: member.id.uuid,
        email: member.attributes.email,
      }));
    dispatch(
      createGroup({
        groupInfo: {
          name: groupName,
        },
        groupMembers,
      }),
    );
  };
  return (
    <FinalForm
      onSubmit={onSubmit}
      render={(formRenderProps: FormRenderProps) => {
        const { handleSubmit, invalid } = formRenderProps;
        const groupNameRequireMessage = required('Vui lòng nhập tên nhóm');
        return (
          <Form onSubmit={handleSubmit}>
            <FieldTextInput
              id="groupName"
              label="Ten nhom"
              name="groupName"
              rootClassName={css.fieldInput}
              validate={groupNameRequireMessage}
            />

            <div className={css.fieldInput}>
              {companyMembers.map((member) => {
                return (
                  <FieldCheckbox
                    key={member.id.uuid}
                    id={`member-${member.id.uuid}`}
                    name="members"
                    label={member.attributes.email}
                    value={member.id.uuid}
                  />
                );
              })}
            </div>
            <Button
              type="submit"
              className={css.submitBtn}
              disabled={invalid || createGroupInProgress}
              inProgress={createGroupInProgress}>
              Tao nhom
            </Button>
          </Form>
        );
      }}
    />
  );
};
export default CreateGroupForm;
