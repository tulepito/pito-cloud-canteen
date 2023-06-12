import { useMemo } from 'react';
import type { FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import differenceBy from 'lodash/differenceBy';

import Avatar from '@components/Avatar/Avatar';
import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldCheckbox from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { companyThunks } from '@redux/slices/company.slice';
import { User } from '@utils/data';
import type { TObject } from '@utils/types';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(companyMembers), JSON.stringify(groupMembers)],
  );

  const initialValues = {
    members: [],
  };

  const handleSubmit = async (values: TObject) => {
    const { members } = values;
    const addedMembers = companyMembers
      .filter((member) => members.includes(member.id.uuid))
      .map((member) => ({
        id: member.id.uuid,
        email: member.attributes.email,
      }));
    await dispatch(
      companyThunks.updateGroup({
        groupId,
        addedMembers,
      }),
    );
    onModalClose();
    await dispatch(
      companyThunks.groupDetailInfo({
        groupId: groupId as string,
      }),
    );
  };

  return (
    <FinalForm
      initialValues={initialValues}
      onSubmit={handleSubmit}
      render={(formRenderProps: FormRenderProps) => {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const { handleSubmit, values } = formRenderProps;
        const { members = [] } = values;
        const submitDisabled = updateGroupInProgress || members.length === 0;

        return (
          <Form onSubmit={handleSubmit}>
            <div className={classNames(css.fieldInput, css.flexWrap)}>
              {memberOptions.map((member: any) => {
                const memberUser = User(member);
                const { firstName, lastName } = memberUser.getProfile();

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
                        <Avatar
                          disableProfileLink
                          className={css.smallAvatar}
                          user={member}
                        />
                        <div>
                          <div className={css.name}>
                            {`${lastName || ''} ${firstName || ''}`}
                          </div>
                          <div
                            className={css.email}
                            title={User(member).getAttributes().email}>
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
