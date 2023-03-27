import { useEffect } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import Button from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import Form from '@components/Form/Form';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconSpinner from '@components/Icons/IconSpinner/IconSpinner';
import {
  composeValidators,
  emailsWithCommasValid,
  replaceSpaceByCommas,
} from '@src/utils/validators';
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
  customSubmit?: (values: TAddCompanyMembersFormValues) => any;
};
type TAddCompanyMembersFormComponentProps =
  FormRenderProps<TAddCompanyMembersFormValues> & Partial<TExtraProps>;
type TAddCompanyMembersFormProps = FormProps<TAddCompanyMembersFormValues> &
  TExtraProps;

const AddCompanyMembersFormComponent: React.FC<
  TAddCompanyMembersFormComponentProps
> = (props) => {
  const {
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
    customSubmit,
  } = props;
  const intl = useIntl();

  const addUserToFormState = async () => {
    if (!queryUsersByEmail) return;
    const { email } = values;
    const emailAsArray = email.split(',');

    await queryUsersByEmail(emailAsArray);
    form.change('email', '');
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

  const onKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.key === 'Enter' && form.getState().valid) {
      return addUserToFormState();
    }
  };

  const handleSubmitOnClick = () => {
    if (usersToRender.length > 0 && customSubmit)
      return customSubmit(form.getState().values);
  };

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
      }}>
      <div>
        <div className={css.emailWrapper}>
          <FieldTextInput
            onKeyUp={onKeyUp}
            className={css.emailField}
            id="email"
            name="email"
            placeholder={intl.formatMessage({
              id: 'AddCompanyMembersForm.emailPlaceholder',
            })}
            parse={replaceSpaceByCommas}
            validate={composeValidators(
              emailsWithCommasValid(
                intl.formatMessage({
                  id: 'AddCompanyMembersForm.emailInvalid',
                }),
              ),
            )}
          />
          {queryUserInProgress && <IconSpinner className={css.loadingIcon} />}
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
            onClick={handleSubmitOnClick}
            type="button"
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
  const customSubmit = (values: TAddCompanyMembersFormValues) => {
    return props.onSubmit(values, null as any);
  };

  return (
    <FinalForm
      {...props}
      onSubmit={() => {}}
      customSubmit={customSubmit}
      component={AddCompanyMembersFormComponent}
    />
  );
};

export default AddCompanyMembersForm;
