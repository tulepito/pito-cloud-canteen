import FieldTextInput from '@components/FieldTextInput/FieldTextInput';
import Form from '@components/Form/Form';
import FacebookIcon from '@components/Icons/FacebookIcon';
import GoogleIcon from '@components/Icons/GoogleIcon';
import {
  composeValidators,
  emailFormatValid,
  passwordFormatValid,
  required,
} from '@utils/validators';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import css from './SignInForm.module.scss';

type TSignInFormProps = {
  onSubmit: (values: Record<string, any>) => void;
  inProgress: Boolean;
  errorMessage?: ReactNode;
};

const SignInForm: React.FC<TSignInFormProps> = (props) => {
  // eslint-disable-next-line unused-imports/no-unused-vars
  const { inProgress, errorMessage, ...restProps } = props;
  const intl = useIntl();

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

  const facebookLoginText = intl.formatMessage({
    id: 'SignInForm.facebookLoginText',
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

  return (
    <FinalForm
      {...restProps}
      render={(formRenderProps: any) => {
        const { rootClassName, className, formId, handleSubmit, invalid } =
          formRenderProps;
        const submitDisable = invalid;

        const classes = classNames(rootClassName || css.root, className);

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
              <FieldTextInput
                id={formId ? `${formId}.password` : 'password'}
                name="password"
                placeholder={passwordPlaceholder}
                validate={passwordValidators}
              />
              <div className={css.forgotPassword}>{forgotPasswordText}</div>

              {errorMessage && (
                <div className={css.errorSignIn}>{errorMessage}</div>
              )}
              <button
                className={css.submitButton}
                type="submit"
                disabled={submitDisable}>
                {submitButtonText}
              </button>
              <div className={css.orText}>
                <span>{orText}</span>
              </div>
              <button className={css.facebookLoginButton} type="button">
                <FacebookIcon className={css.facebookIcon} />
                <span>{facebookLoginText}</span>
              </button>
              <button className={css.googleLoginButton} type="button">
                <GoogleIcon className={css.googleIcon} />

                <span>{googleLoginText}</span>
              </button>
            </div>
            <div className={css.doNotHaveAnAccount}>
              <div>
                {doNotHaveAnAccountText}{' '}
                <span className={css.toSignUp}> {toSignUp}</span>
              </div>
            </div>
          </Form>
        );
      }}
    />
  );
};

export default SignInForm;
