import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import type { TUser } from '@utils/types';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import FieldCompanyMemberCheckbox from '../FieldCompanyMemberCheckbox/FieldCompanyMemberCheckbox';
import css from './AddCompanyMembersForm.module.scss';

export type TAddCompanyMembersFormValues = {
  email: string;
};

type TExtraProps = {
  users: TUser[];
  queryUsersByEmail: (emailList: string[]) => void;
  queryUserInProgress: boolean;
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
  } = props;
  const intl = useIntl();

  const addUserToFormState = () => {
    if (!queryUsersByEmail) return;
    const { email } = values;
    const emailAsArray = email.split(',');
    return queryUsersByEmail(emailAsArray);
  };

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
          {users?.map((user) => (
            <FieldCompanyMemberCheckbox
              key={user.id.uuid}
              user={user}
              onRemoveItem={removeUserById}
            />
          ))}
          {users?.map((user) => (
            <FieldCompanyMemberCheckbox
              key={user.id.uuid}
              user={user}
              onRemoveItem={removeUserById}
            />
          ))}
          {users?.map((user) => (
            <FieldCompanyMemberCheckbox
              key={user.id.uuid}
              user={user}
              onRemoveItem={removeUserById}
            />
          ))}
        </div>
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
