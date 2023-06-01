import type { ReactNode } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import FixedBottomButtons from '@components/FixedBottomButtons/FixedBottomButtons';
import Form from '@components/Form/Form';
import FieldPasswordInput from '@components/FormFields/FieldPasswordInput/FieldPasswordInput';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconGoogle from '@components/Icons/IconGoogle/IconGoogle';
import IconLock from '@components/Icons/IconLock/IconLock';
import IconMail from '@components/Icons/IconMail/IconMail';
import { generalPaths } from '@src/paths';
import type { TDefaultProps } from '@utils/types';
import {
  composeValidators,
  emailFormatValid,
  passwordFormatValid,
  required,
} from '@utils/validators';

import css from './SignInForm.module.scss';

export type TSignInFormValues = {
  email: string;
  password: string;
};

type TExtraProps = TDefaultProps & {
  formId?: string;
  errorMessage?: ReactNode;
  inProgress: boolean;
};
type TSignInFormComponentProps = FormRenderProps<TSignInFormValues> &
  Partial<TExtraProps>;
type TSignInFormProps = FormProps<TSignInFormValues> & TExtraProps;

const SignInFormComponent: React.FC<TSignInFormComponentProps> = (props) => {
  const intl = useIntl();
  const router = useRouter();

  const { query } = router;
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
  const emailLabel = intl.formatMessage({
    id: 'SignInForm.email.label',
  });
  const passwordPlaceholder = intl.formatMessage({
    id: 'SignInForm.password.placeholder',
  });
  const passwordLabel = intl.formatMessage({
    id: 'SignInForm.password.label',
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
    router.push({ pathname: generalPaths.SignUp, query });
  };

  const navigateToPasswordRecoverPage = () => {
    router.push(generalPaths.RecoveryPassword);
  };

  return (
    <Form className={classes} onSubmit={handleSubmit}>
      <div className={css.formContainer}>
        <div className={css.formTitle}>{formTitle}</div>
        <div className={css.doNotHaveAnAccount}>
          <div>
            {doNotHaveAnAccountText}{' '}
            <span className={css.toSignUp} onClick={navigateToSignUpPage}>
              {' '}
              {toSignUp}
            </span>
          </div>
        </div>
        <FieldTextInput
          id={formId ? `${formId}.email` : 'email'}
          name="email"
          placeholder={emailPlaceholder}
          validate={emailValidators}
          leftIcon={<IconMail />}
          label={emailLabel}
        />

        <FieldPasswordInput
          id={formId ? `${formId}.password` : 'password'}
          name="password"
          placeholder={passwordPlaceholder}
          validate={passwordValidators}
          leftIcon={<IconLock />}
          label={passwordLabel}
        />

        <div className={css.forgotPassword}>
          <span onClick={navigateToPasswordRecoverPage}>
            {forgotPasswordText}
          </span>
        </div>

        {errorMessage && <div className={css.errorSignIn}>{errorMessage}</div>}
        <div className={css.desktopView}>
          <Button
            variant="cta"
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
            <IconGoogle className={css.googleIcon} />
            <span>{googleLoginText}</span>
          </Button>
        </div>
        <FixedBottomButtons
          FirstButton={
            <Button
              variant="cta"
              className={css.submitButton}
              type="submit"
              disabled={submitDisable}
              inProgress={submitInprogress}>
              {submitButtonText}
            </Button>
          }
          separator={
            <div className={css.orText}>
              <span>{orText}</span>
            </div>
          }
          SecondButton={
            <Button className={css.googleLoginButton} type="button" disabled>
              <IconGoogle className={css.googleIcon} />
              <span>{googleLoginText}</span>
            </Button>
          }
        />
      </div>
    </Form>
  );
};

const SignInForm: React.FC<TSignInFormProps> = (props) => {
  return <FinalForm {...props} component={SignInFormComponent} />;
};

export default SignInForm;
