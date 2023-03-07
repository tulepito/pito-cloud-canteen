import { useEffect } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import Button from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import Form from '@components/Form/Form';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import type { TCompanyMemberWithDetails, TUser } from '@utils/types';

import FieldCompanyMember from '../FieldCompanyMember/FieldCompanyMember';

import css from './AddCompanyMembersForm.module.scss';

export type TAddCompanyMembersFormValues = {
  email: string;
  userIdList: string[];
  noAccountEmailList: string[];
};

type TExtraProps = {
  users: TUser[];
  queryUsersByEmail: (emailList: string[]) => void;
  queryUserInProgress: boolean;
  removeNotFoundUserByEmail: (email: string) => void;
  removeUserById: (id: string) => void;
  notFoundUsers: string[];
  handleCancel: () => void;
  inProgress: boolean;
  formError: any;
};
type TAddCompanyMembersFormComponentProps =
  FormRenderProps<TAddCompanyMembersFormValues> & Partial<TExtraProps>;
type TAddCompanyMembersFormProps = FormProps<TAddCompanyMembersFormValues> &
  TExtraProps;

const AddCompanyMembersFormComponent: React.FC<
  TAddCompanyMembersFormComponentProps
> = (props) => {
  const {
    handleSubmit,
    queryUsersByEmail,
    queryUserInProgress,
    users,
    values,
    removeUserById,
    notFoundUsers,
    removeNotFoundUserByEmail,
    handleCancel,
    form,
    inProgress,
    formError,
  } = props;
  const intl = useIntl();

  const addUserToFormState = () => {
    if (!queryUsersByEmail) return;
    const { email } = values;
    const emailAsArray = email.split(',');
    return queryUsersByEmail(emailAsArray);
  };

  const usersToRender = [
    ...(users as TUser[]),
    ...(notFoundUsers as string[]),
  ] as TUser[];

  useEffect(() => {
    const userIdList = users?.map((user) => user.id.uuid);
    form.change('userIdList', userIdList);
    form.change('noAccountEmailList', notFoundUsers);
  }, [JSON.stringify(users), JSON.stringify(notFoundUsers)]);

  return (
    <Form onSubmit={handleSubmit}>
      <div>
        <div className={css.emailWrapper}>
          <FieldTextInput
            className={css.emailField}
            id="email"
            name="email"
            placeholder={intl.formatMessage({
              id: 'AddCompanyMembersForm.emailPlaceholder',
            })}
          />
          <Button
            onClick={addUserToFormState}
            disabled={queryUserInProgress}
            inProgress={queryUserInProgress}
            className={css.addButton}
            type="button">
            {intl.formatMessage({ id: 'AddCompanyMembersForm.addButton' })}
          </Button>
        </div>
        <div className={css.fieldMember}>
          {usersToRender?.map((user) => (
            <FieldCompanyMember
              key={user?.id?.uuid || user}
              user={user as TCompanyMemberWithDetails}
              onRemoveItem={removeUserById as any}
              onremoveNotFoundUserByEmail={removeNotFoundUserByEmail as any}
            />
          ))}
        </div>
        <div className={css.actionBtn}>
          <Button
            disabled={inProgress}
            inProgress={inProgress}
            className={css.submitButton}>
            {intl.formatMessage({ id: 'AddCompanyMembersForm.submitButton' })}
          </Button>
          <Button
            disabled={inProgress}
            onClick={handleCancel}
            className={css.lightButton}
            type="button">
            {intl.formatMessage({ id: 'AddCompanyMembersForm.cancelButton' })}
          </Button>
        </div>
        {formError && <ErrorMessage message={formError.message} />}
      </div>
    </Form>
  );
};

const AddCompanyMembersForm: React.FC<TAddCompanyMembersFormProps> = (
  props,
) => {
  return <FinalForm {...props} component={AddCompanyMembersFormComponent} />;
};

export default AddCompanyMembersForm;
