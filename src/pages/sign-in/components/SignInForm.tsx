import Button from '@components/Button/Button';
import FieldPasswordInput from '@components/FieldPasswordInput/FieldPasswordInput';
import FieldTextInput from '@components/FieldTextInput/FieldTextInput';
import Form from '@components/Form/Form';
import GoogleIcon from '@components/Icons/GoogleIcon';
import { generalPaths } from '@src/paths';
import {
  composeValidators,
  emailFormatValid,
  passwordFormatValid,
  required,
} from '@utils/validators';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import type { ReactNode } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import css from './SignInForm.module.scss';

export type TSignInFormValues = {
  email: string;
  password: string;
};

type TExtraProps = {
  formId?: string;
  errorMessage?: ReactNode;
  rootClassName?: string;
  className?: string;
  inProgress: boolean;
};
type TSignInFormComponentProps = FormRenderProps<TSignInFormValues> &
  Partial<TExtraProps>;
type TSignInFormProps = FormProps<TSignInFormValues> & TExtraProps;

const SignInFormComponent: React.FC<TSignInFormComponentProps> = (props) => {
  const intl = useIntl();
  const router = useRouter();
  const {
    rootClassName,
    className,
    errorMessage,
    formId,
    handleSubmit,
    invalid,
    submitting,
    inProgress,
  } = props;
  const submitDisable = invalid || inProgress || submitting;
  const submitInprogress = inProgress || submitting;
  const classes = classNames(rootClassName || css.root, className);

  const formTitle = intl.formatMessage({
    id: 'SignInForm.title',
  });

  const emailPlaceholder = intl.formatMessage({
    id: 'SignInForm.email.placeholder',
  });
  const passwordPlaceholder = intl.formatMessage({
    id: 'SignInForm.password.placeholder',
  });

  const submitButtonText = intl.formatMessage({
    id: 'SignInForm.submitButtonText',
  });

  const forgotPasswordText = intl.formatMessage({
    id: 'SignInForm.forgotPassword',
  });
  const orText = intl.formatMessage({
    id: 'SignInForm.orText',
  });

  const googleLoginText = intl.formatMessage({
    id: 'SignInForm.googleLoginText',
  });

  const doNotHaveAnAccountText = intl.formatMessage({
    id: 'SignInForm.doNotHaveAnAccount',
  });
  const toSignUp = intl.formatMessage({
    id: 'SignInForm.toSignUp',
  });

  const emailValidators = composeValidators(
    required(intl.formatMessage({ id: 'SignInForm.email.required' })),
    emailFormatValid(intl.formatMessage({ id: 'SignInForm.email.invalid' })),
  );
  const passwordValidators = composeValidators(
    required(intl.formatMessage({ id: 'SignInForm.password.required' })),
    passwordFormatValid(
      intl.formatMessage({ id: 'SignInForm.password.invalid' }),
    ),
  );

  const navigateToSignUpPage = () => {
    router.push(generalPaths.SignUp);
  };

  const navigateToPasswordRecoverPage = () => {
    router.push(generalPaths.RecoveryPassword);
  };

  return (
    <Form className={classes} onSubmit={handleSubmit}>
      <div className={css.formContainer}>
        <h2 className={css.formTitle}>{formTitle}</h2>

        <FieldTextInput
          id={formId ? `${formId}.email` : 'email'}
          name="email"
          placeholder={emailPlaceholder}
          validate={emailValidators}
        />

        <FieldPasswordInput
          id={formId ? `${formId}.password` : 'password'}
          name="password"
          placeholder={passwordPlaceholder}
          validate={passwordValidators}
        />

        <div className={css.forgotPassword}>
          <span onClick={navigateToPasswordRecoverPage}>
            {forgotPasswordText}
          </span>
        </div>

        {errorMessage && <div className={css.errorSignIn}>{errorMessage}</div>}
        <Button
          className={css.submitButton}
          type="submit"
          disabled={submitDisable}
          inProgress={submitInprogress}>
          {submitButtonText}
        </Button>
        <div className={css.orText}>
          <span>{orText}</span>
        </div>
        <Button className={css.googleLoginButton} type="button" disabled>
          <GoogleIcon className={css.googleIcon} />
          <span>{googleLoginText}</span>
        </Button>
      </div>
      <div className={css.doNotHaveAnAccount}>
        <div>
          {doNotHaveAnAccountText}{' '}
          <span className={css.toSignUp} onClick={navigateToSignUpPage}>
            {' '}
            {toSignUp}
          </span>
        </div>
      </div>
    </Form>
  );
};

const SignInForm: React.FC<TSignInFormProps> = (props) => {
  return <FinalForm {...props} component={SignInFormComponent} />;
};

export default SignInForm;
