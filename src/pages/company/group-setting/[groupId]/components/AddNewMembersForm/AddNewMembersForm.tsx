import Button from '@components/Button/Button';
import FieldCheckbox from '@components/FieldCheckbox/FieldCheckbox';
import Form from '@components/Form/Form';
import { useAppDispatch, useAppSelector } from '@src/redux/reduxHooks';
import { BookerManageCompany } from '@src/redux/slices/company.slice';
import differenceBy from 'lodash/differenceBy';
import { useMemo } from 'react';
import type { FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import css from './AddNewMembersForm.module.scss';

type AddNewMembersFormProps = {
  companyMembers: any[];
  groupMembers: any[];
  groupId: string;
};
const AddNewMembersForm: React.FC<AddNewMembersFormProps> = ({
  companyMembers,
  groupMembers,
  groupId,
}) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const updateGroupInProgress = useAppSelector(
    (state) => state.company.updateGroupInProgress,
  );

  const memberOptions = useMemo(
    () => differenceBy(companyMembers, groupMembers, 'id.uuid'),
    [companyMembers, groupMembers],
  );
  const onSubmit = (values: Record<string, any>) => {
    const { members } = values;
    const addedMembers = companyMembers
      .filter((member) => members.includes(member.id.uuid))
      .map((member) => ({
        id: member.id.uuid,
        email: member.attributes.email,
      }));
    dispatch(
      BookerManageCompany.updateGroup({
        groupId,
        addedMembers,
      }),
    );
  };
  return (
    <FinalForm
      onSubmit={onSubmit}
      render={(formRenderProps: FormRenderProps) => {
        const { handleSubmit, pristine } = formRenderProps;
        return (
          <Form onSubmit={handleSubmit}>
            <div className={css.fieldInput}>
              {memberOptions.map((member: any) => {
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
              disabled={pristine || updateGroupInProgress}
              inProgress={updateGroupInProgress}>
              {intl.formatMessage({ id: 'AddNewMembersForm.submit' })}
            </Button>
          </Form>
        );
      }}
    />
  );
};
export default AddNewMembersForm;
