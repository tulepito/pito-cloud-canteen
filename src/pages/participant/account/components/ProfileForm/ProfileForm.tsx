import { useField, useForm } from 'react-final-form-hooks';
import { useIntl } from 'react-intl';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import { FieldTextInputComponent } from '@components/FormFields/FieldTextInput/FieldTextInput';
import type { TCurrentUser } from '@src/utils/types';
import { phoneNumberFormatValid } from '@src/utils/validators';

import AvatarForm from '../AvatarForm/AvatarForm';

import css from './ProfileForm.module.scss';

export type TProfileFormValues = {
  name: string;
  email: string;
  phoneNumber: string;
};

type TProfileFormProps = {
  onSubmit: (values: TProfileFormValues) => void;
  initialValues: TProfileFormValues;
  inProgress: boolean;
  currentUser?: TCurrentUser;
};

const ProfileForm: React.FC<TProfileFormProps> = ({
  onSubmit,
  initialValues,
  inProgress,
  currentUser,
}) => {
  const intl = useIntl();
  const validate = (values: TProfileFormValues) => {
    const errors: any = {};
    if (!values.name) {
      errors.name = intl.formatMessage({
        id: 'SignUpForm.name.required',
      });
    }

    if (!values.phoneNumber) {
      errors.phoneNumber = intl.formatMessage({
        id: 'SignUpForm.phoneNumber.required',
      });
    }
    if (
      phoneNumberFormatValid(
        intl.formatMessage({ id: 'SignUpForm.phoneNumber.invalid' }),
      )(values.phoneNumber)
    ) {
      errors.phoneNumber = intl.formatMessage({
        id: 'SignUpForm.phoneNumber.invalid',
      });
    }

    return errors;
  };
  const { form, handleSubmit, submitting, hasValidationErrors, pristine } =
    useForm<TProfileFormValues>({
      onSubmit,
      validate,
      initialValues,
    });

  const name = useField('name', form);
  const email = useField('email', form);
  const phoneNumber = useField('phoneNumber', form);
  const disabledSubmit =
    inProgress || submitting || hasValidationErrors || pristine;

  return (
    <div className={css.root}>
      <div className={css.header}>
        {intl.formatMessage({
          id: 'ParticipantAccountSettingRoute.description',
        })}
      </div>
      <div className={css.formContainer}>
        <div className={css.avatarSection}>
          <AvatarForm onSubmit={() => {}} currentUser={currentUser!} />
        </div>
        <Form onSubmit={handleSubmit} className={css.form}>
          <div className={css.fieldsContainer}>
            <div className={css.fieldWrapper}>
              <FieldTextInputComponent
                id={`name`}
                name="name"
                label={intl.formatMessage({ id: 'ho-va-ten' })}
                input={name.input}
                meta={name.meta}
                placeholder="Tên"
                className={css.fieldInput}
              />
            </div>
            <div className={css.fieldWrapper}>
              <FieldTextInputComponent
                id={`email`}
                name="email"
                label="Email"
                onChange={(e: any) => e.preventDefault()}
                input={email.input}
                meta={email.meta}
                placeholder="example@gmail.com"
                className={css.fieldInput}
              />
            </div>
            <div className={css.fieldWrapper}>
              <FieldTextInputComponent
                id={`phoneNumber`}
                name="phoneNumber"
                label={intl.formatMessage({ id: 'so-dien-thoai' })}
                input={phoneNumber.input}
                meta={phoneNumber.meta}
                placeholder="0123456789"
                className={css.fieldInput}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={disabledSubmit}
            inProgress={inProgress}
            className={css.submitBtn}>
            {intl.formatMessage({ id: 'AddOrderForm.moibleSubmitButtonText' })}
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default ProfileForm;
