import Avatar from '@components/Avatar/Avatar';
import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldCheckbox from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { BookerManageCompany } from '@redux/slices/company.slice';
import { User } from '@utils/data';
import type { TObject } from '@utils/types';
import classNames from 'classnames';
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
  onModalClose: () => void;
};
const AddNewMembersForm: React.FC<AddNewMembersFormProps> = ({
  companyMembers,
  groupMembers,
  groupId,
  onModalClose,
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

  const initialValues = {
    members: [],
  };
  const onSubmit = (values: TObject) => {
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
    ).then(() => {
      onModalClose();
    });
  };
  return (
    <FinalForm
      initialValues={initialValues}
      onSubmit={onSubmit}
      render={(formRenderProps: FormRenderProps) => {
        const { handleSubmit, values } = formRenderProps;
        const { members = [] } = values;
        const submitDisabled = updateGroupInProgress || members.length === 0;
        return (
          <Form onSubmit={handleSubmit}>
            <div className={classNames(css.fieldInput, css.flexWrap)}>
              {memberOptions.map((member: any) => {
                return (
                  <div key={member.id.uuid} className={css.itemWrapper}>
                    <FieldCheckbox
                      key={member.id.uuid}
                      id={`member-${member.id.uuid}`}
                      name="members"
                      value={member.id.uuid}
                      label={' '}
                    />
                    <div className={css.memberItem}>
                      <div className={css.memberWrapper}>
                        <Avatar className={css.smallAvatar} user={member} />
                        <div>
                          <div className={css.name}>
                            {User(member).getProfile().displayName}
                          </div>
                          <div className={css.email}>
                            {User(member).getAttributes().email}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button
              type="submit"
              className={css.submitBtn}
              disabled={submitDisabled}
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
