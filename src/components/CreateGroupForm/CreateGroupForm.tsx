import type { FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

import Avatar from '@components/Avatar/Avatar';
import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldCheckbox from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { companyThunks } from '@src/redux/slices/company.slice';
import { User } from '@utils/data';
import type { TObject } from '@utils/types';
import { required } from '@utils/validators';

import css from './CreateGroupForm.module.scss';

type CreateGroupFormProps = {
  companyMembers: any[];
  originCompanyMembers: any;
  onModalClose: () => void;
};

const CreateGroupForm: React.FC<CreateGroupFormProps> = ({
  companyMembers,
  onModalClose,
}) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const createGroupInProgress = useAppSelector(
    (state) => state.company.createGroupInProgress,
  );
  const onSubmit = (values: TObject) => {
    const { groupName, members = [] } = values;
    const groupMembers = companyMembers.reduce((result, member) => {
      const id = member.id.uuid;
      const newItem = {
        id,
        email: member.attributes.email,
      };

      return !members.includes(id) ? result : result.concat([newItem]);
    }, []);
    dispatch(
      companyThunks.createGroup({
        groupInfo: {
          name: groupName,
        },
        groupMembers,
      }),
    ).then(() => {
      onModalClose();
    });
  };

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
              placeholder={intl.formatMessage({
                id: 'CreateGroupForm.groupName.placeholder',
              })}
              name="groupName"
              rootClassName={css.fieldInput}
              validate={groupNameRequireMessage}
            />
            <RenderWhen condition={!!companyMembers?.length}>
              <>
                <div className={classNames(css.fieldInput, css.flexWrap)}>
                  {companyMembers.map((member) => {
                    const memberUser = User(member);
                    const memberId = memberUser.getId();
                    const { email: memberEmail } = memberUser.getAttributes();
                    const { firstName, lastName } = memberUser.getProfile();

                    return (
                      <div key={member.id.uuid} className={css.itemWrapper}>
                        <FieldCheckbox
                          key={memberId}
                          id={`member-${memberId}`}
                          name="members"
                          value={memberId}
                          label={' '}
                        />
                        <div className={css.memberItem}>
                          <div className={css.memberWrapper}>
                            <Avatar
                              className={css.smallAvatar}
                              user={member}
                              disableProfileLink
                            />
                            <div>
                              <div className={css.name}>
                                {`${lastName || ''} ${firstName || ''}`}
                              </div>
                              <div className={css.email} title={memberEmail}>
                                {memberEmail}
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
                  disabled={invalid || createGroupInProgress}
                  inProgress={createGroupInProgress}>
                  {intl.formatMessage({
                    id: 'CreateGroupForm.createGroup',
                  })}
                </Button>
              </>
            </RenderWhen>
            <RenderWhen condition={!companyMembers?.length}>
              <p className="text-center text-gray-500 mt-4">
                Không có thành viên nào không có nhóm hiện tại.
              </p>
            </RenderWhen>
          </Form>
        );
      }}
    />
  );
};
export default CreateGroupForm;
