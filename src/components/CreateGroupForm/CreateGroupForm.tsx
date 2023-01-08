import Button from '@components/Button/Button';
import CSVFieldInput from '@components/CSVFieldInput/CSVFieldInput';
import Form from '@components/Form/Form';
import FieldCheckbox from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { BookerManageCompany } from '@src/redux/slices/company.slice';
import type { TObject } from '@utils/types';
import { required } from '@utils/validators';
import { useMemo, useState } from 'react';
import type { FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

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
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const [loadedMembers, setLoadedMembers] = useState<any[]>([]);
  const createGroupInProgress = useAppSelector(
    (state) => state.company.createGroupInProgress,
  );
  const onSubmit = (values: TObject) => {
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
        const groupNameRequireMessage = required(
          intl.formatMessage({ id: 'CreateGroupForm.groupNameRequireMessage' }),
        );
        return (
          <Form onSubmit={handleSubmit}>
            <FieldTextInput
              id="groupName"
              label={intl.formatMessage({
                id: 'CreateGroupForm.groupName',
              })}
              name="groupName"
              rootClassName={css.fieldInput}
              validate={groupNameRequireMessage}
            />
            <div className={css.uploadMemberListWrapper}>
              <div className={css.uploadMemberListTitle}>
                {intl.formatMessage({ id: 'CreateGroupForm.uploadMemberList' })}
              </div>
              <CSVFieldInput setData={setLoadedMembers} />
            </div>
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
              {intl.formatMessage({
                id: 'CreateGroupForm.createGroup',
              })}
            </Button>
          </Form>
        );
      }}
    />
  );
};
export default CreateGroupForm;
