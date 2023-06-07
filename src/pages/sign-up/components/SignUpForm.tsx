import type { ReactNode } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldCheckbox from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import FieldPasswordInput from '@components/FormFields/FieldPasswordInput/FieldPasswordInput';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconLock from '@components/Icons/IconLock/IconLock';
import IconMail from '@components/Icons/IconMail/IconMail';
import IconPhone2 from '@components/Icons/IconPhone2/IconPhone2';
import IconUser2 from '@components/Icons/IconUser2/IconUser2';
import { generalPaths } from '@src/paths';
import type { TDefaultProps } from '@utils/types';
import {
  composeValidators,
  composeValidatorsWithAllValues,
  emailFormatValid,
  passwordFormatValid,
  passwordMatchConfirmPassword,
  phoneNumberFormatValid,
  required,
} from '@utils/validators';

import css from './SignUpForm.module.scss';

export type TSignUpFormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber?: string;
  privacyAndPolicy: boolean;
};

type TExtraProps = TDefaultProps & {
  formId?: string;
  errorMessage?: ReactNode;
  inProgress?: boolean;
};
type TSignUpFormProps = FormProps<TSignUpFormValues> & Partial<TExtraProps>;
type TSignUpFormComponentProps = FormRenderProps<TSignUpFormValues> &
  TExtraProps;

const SignUpFormComponent: React.FC<TSignUpFormComponentProps> = (props) => {
  const intl = useIntl();
  const router = useRouter();
  const {
    inProgress,
    errorMessage,
    rootClassName,
    className,
    formId,
    handleSubmit,
    invalid,
    values: { privacyAndPolicy },
  } = props;
  const classes = classNames(rootClassName || css.root, className);
  const haveAgreed = privacyAndPolicy === true;
  const submitDisable = !haveAgreed || invalid || inProgress;

  const formTitle = intl.formatMessage({
    id: 'SignUpForm.title',
  });

  const namePlaceholder = intl.formatMessage({
    id: 'SignUpForm.name.placeholder',
  });
  const nameLabel = intl.formatMessage({
    id: 'SignUpForm.name.label',
  });
  const emailPlaceholder = intl.formatMessage({
    id: 'SignUpForm.email.placeholder',
  });
  const emailLabel = intl.formatMessage({
    id: 'SignUpForm.email.label',
  });
  const passwordPlaceholder = intl.formatMessage({
    id: 'SignUpForm.password.placeholder',
  });
  const passwordLabel = intl.formatMessage({
    id: 'SignUpForm.password.label',
  });

  const confirmPasswordPlaceholder = intl.formatMessage({
    id: 'SignUpForm.confirmPassword.placeholder',
  });
  const confirmPasswordLabel = intl.formatMessage({
    id: 'SignUpForm.confirmPassword.label',
  });

  const phoneNumberPlaceholder = intl.formatMessage({
    id: 'SignUpForm.phoneNumber.placeholder',
  });
  const phoneNumberLabel = intl.formatMessage({
    id: 'SignUpForm.phoneNumber.label',
  });

  const privacyPolicyPartA = intl.formatMessage({
    id: 'SignUpForm.privacyPolicy.partA',
  });
  const privacyPolicyPartB = intl.formatMessage({
    id: 'SignUpForm.privacyPolicy.partB',
  });

  const submitButtonText = intl.formatMessage({
    id: 'SignUpForm.submitButtonText',
  });

  const haveAnAccountText = intl.formatMessage({
    id: 'SignUpForm.haveAnAccount',
  });
  const toSignIn = intl.formatMessage({
    id: 'SignUpForm.toSignIn',
  });

  const nameValidators = composeValidators(
    required(intl.formatMessage({ id: 'SignUpForm.name.required' })),
  );
  const emailValidators = composeValidators(
    required(intl.formatMessage({ id: 'SignUpForm.email.required' })),
    emailFormatValid(intl.formatMessage({ id: 'SignUpForm.email.invalid' })),
  );
  const passwordValidators = composeValidators(
    required(intl.formatMessage({ id: 'SignUpForm.password.required' })),
    passwordFormatValid(
      intl.formatMessage({ id: 'SignUpForm.password.invalid' }),
    ),
  );
  const confirmPasswordValidators = composeValidatorsWithAllValues(
    required(intl.formatMessage({ id: 'SignUpForm.confirmPassword.required' })),
    passwordFormatValid(
      intl.formatMessage({ id: 'SignUpForm.confirmPassword.invalid' }),
    ),
    passwordMatchConfirmPassword(
      intl.formatMessage({
        id: 'SignUpForm.confirmPasswordMatchPassword.invalid',
      }),
    ),
  );
  const phoneNumberValidators = phoneNumberFormatValid(
    intl.formatMessage({ id: 'SignUpForm.phoneNumber.invalid' }),
  );

  const navigateToSignInPage = () => {
    router.push(generalPaths.SignIn);
  };

  return (
    <Form className={classes} onSubmit={handleSubmit}>
      <div className={css.formContainer}>
        <div className={css.formTitle}>{formTitle}</div>
        <div className={css.haveAccountContainer}>
          <div>
            {haveAnAccountText}{' '}
            <span className={css.toSignIn} onClick={navigateToSignInPage}>
              {' '}
              {toSignIn}
            </span>
          </div>
        </div>
        <FieldTextInput
          id={formId ? `${formId}.name` : 'name'}
          name="name"
          placeholder={namePlaceholder}
          validate={nameValidators}
          label={nameLabel}
          leftIcon={<IconUser2 />}
        />

        <FieldTextInput
          id={formId ? `${formId}.email` : 'email'}
          name="email"
          placeholder={emailPlaceholder}
          validate={emailValidators}
          label={emailLabel}
          leftIcon={<IconMail />}
        />

        <FieldPasswordInput
          id={formId ? `${formId}.password` : 'password'}
          name="password"
          placeholder={passwordPlaceholder}
          validate={passwordValidators}
          label={passwordLabel}
          leftIcon={<IconLock />}
        />

        <FieldPasswordInput
          id={formId ? `${formId}.confirmPassword` : 'confirmPassword'}
          name="confirmPassword"
          placeholder={confirmPasswordPlaceholder}
          validate={confirmPasswordValidators}
          label={confirmPasswordLabel}
          leftIcon={<IconLock />}
        />

        <FieldTextInput
          id={formId ? `${formId}.phoneNumber` : 'phoneNumber'}
          name="phoneNumber"
          placeholder={phoneNumberPlaceholder}
          validate={phoneNumberValidators}
          label={phoneNumberLabel}
          leftIcon={<IconPhone2 />}
        />

        <FieldCheckbox
          id={formId ? `${formId}.privacyAndPolicy` : 'privacyAndPolicy'}
          name="privacyAndPolicy"
          label={
            <div className={css.policyText}>
              {privacyPolicyPartA}
              <u className={css.privacyPolicyText}>{privacyPolicyPartB}</u>
            </div>
          }
        />

        {errorMessage && <div className={css.errorSignUp}>{errorMessage}</div>}
      </div>
      <Button
        inProgress={inProgress}
        className={css.submitButton}
        type="submit"
        disabled={submitDisable}>
        {submitButtonText}
      </Button>
    </Form>
  );
};

const SignUpForm: React.FC<TSignUpFormProps> = (props) => {
  return <FinalForm {...props} component={SignUpFormComponent} />;
};

export default SignUpForm;
