import Button from '@components/Button/Button';
import CSVFieldInput from '@components/CSVFieldInput/CSVFieldInput';
import FieldCheckbox from '@components/FieldCheckbox/FieldCheckbox';
import FieldTextInput from '@components/FieldTextInput/FieldTextInput';
import Form from '@components/Form/Form';
import { useAppDispatch, useAppSelector } from '@src/redux/reduxHooks';
import { BookerManageCompany } from '@src/redux/slices/company.slice';
import { required } from '@utils/validators';
import { useMemo, useState } from 'react';
import type { FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';

import css from './CreateGroupForm.module.scss';
import LoadedMembers from './LoadedMembers';

type CreateGroupFormProps = {
  companyMembers: any[];
  originCompanyMembers: any;
};

const filterCompanyMembers = (companyMember: any[], loadedMembers: any[]) => {
  return loadedMembers.map((member) =>
    companyMember[member.email] ? companyMember[member.email] : member,
  );
};
const CreateGroupForm: React.FC<CreateGroupFormProps> = ({
  companyMembers,
  originCompanyMembers,
}) => {
  const dispatch = useAppDispatch();
  const [loadedMembers, setLoadedMemebers] = useState<any[]>([]);
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
      BookerManageCompany.createGroup({
        groupInfo: {
          name: groupName,
        },
        groupMembers,
      }),
    );
  };
  const formattedLoadedMembers = useMemo(
    () => filterCompanyMembers(originCompanyMembers, loadedMembers),
    [originCompanyMembers, loadedMembers],
  );
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
            <CSVFieldInput setData={setLoadedMemebers} />
            <LoadedMembers
              formattedLoadedMembers={formattedLoadedMembers}
              companyMembers={companyMembers}
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
