import Avatar from '@components/Avatar/Avatar';
import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldCheckbox from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { companyThunks } from '@src/redux/slices/company.slice';
import { User } from '@utils/data';
import type { TObject } from '@utils/types';
import { required } from '@utils/validators';
import classNames from 'classnames';
import type { FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

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
            <div className={classNames(css.fieldInput, css.flexWrap)}>
              {companyMembers.map((member) => {
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
