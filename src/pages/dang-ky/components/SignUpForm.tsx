import Button from '@components/Button/Button';
import FieldCheckbox from '@components/FieldCheckbox/FieldCheckbox';
import FieldPasswordInput from '@components/FieldPasswordInput/FieldPasswordInput';
import FieldTextInput from '@components/FieldTextInput/FieldTextInput';
import Form from '@components/Form/Form';
import paths from '@src/paths';
import {
  composeValidators,
  composeValidatorsWithAllValues,
  emailFormatValid,
  passwordFormatValid,
  passwordMatchConfirmPassword,
  phoneNumberFormatValid,
  required,
} from '@utils/validators';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import type { ReactNode } from 'react';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import css from './SignUpForm.module.scss';

type TSignUpFormProps = {
  onSubmit: (values: Record<string, any>) => void;
  inProgress: boolean;
  errorMessage?: ReactNode;
};

const SignUpForm: React.FC<TSignUpFormProps> = (props) => {
  const { inProgress, errorMessage, ...restProps } = props;
  const intl = useIntl();
  const router = useRouter();

  const formTitle = intl.formatMessage({
    id: 'SignUpForm.title',
  });

  const namePlaceholder = intl.formatMessage({
    id: 'SignUpForm.name.placeholder',
  });
  const emailPlaceholder = intl.formatMessage({
    id: 'SignUpForm.email.placeholder',
  });
  const passwordPlaceholder = intl.formatMessage({
    id: 'SignUpForm.password.placeholder',
  });
  const confirmPasswordPlaceholder = intl.formatMessage({
    id: 'SignUpForm.confirmPassword.placeholder',
  });
  const phoneNumberPlaceholder = intl.formatMessage({
    id: 'SignUpForm.phoneNumber.placeholder',
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
    router.push(paths.SignIn);
  };

  return (
    <FinalForm
      {...restProps}
      render={(formRenderProps: any) => {
        const {
          rootClassName,
          className,
          formId,
          handleSubmit,
          invalid,
          values,
        } = formRenderProps;
        const classes = classNames(rootClassName || css.root, className);
        const { privacyAndPolicy } = values;
        const haveAgreed = privacyAndPolicy === true;
        const submitDisable = !haveAgreed || invalid || inProgress;

        return (
          <Form className={classes} onSubmit={handleSubmit}>
            <div className={css.formContainer}>
              <h2 className={css.formTitle}>{formTitle}</h2>

              <FieldTextInput
                id={formId ? `${formId}.name` : 'name'}
                name="name"
                placeholder={namePlaceholder}
                validate={nameValidators}
              />

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

              <FieldPasswordInput
                id={formId ? `${formId}.confirmPassword` : 'confirmPassword'}
                name="confirmPassword"
                placeholder={confirmPasswordPlaceholder}
                validate={confirmPasswordValidators}
              />

              <FieldTextInput
                id={formId ? `${formId}.phoneNumber` : 'phoneNumber'}
                name="phoneNumber"
                placeholder={phoneNumberPlaceholder}
                validate={phoneNumberValidators}
              />

              <FieldCheckbox
                id={formId ? `${formId}.privacyAndPolicy` : 'privacyAndPolicy'}
                name="privacyAndPolicy"
                label={
                  <div>
                    {privacyPolicyPartA}
                    <u className={css.privacyPolicyText}>
                      {privacyPolicyPartB}
                    </u>
                  </div>
                }
              />

              {errorMessage && (
                <div className={css.errorSignUp}>{errorMessage}</div>
              )}
              <Button
                // inProgress={inProgress}
                className={css.submitButton}
                type="submit"
                disabled={submitDisable}>
                {submitButtonText}
              </Button>
            </div>
            <div className={css.haveAccountContainer}>
              <div>
                {haveAnAccountText}{' '}
                <span className={css.toSignIn} onClick={navigateToSignInPage}>
                  {' '}
                  {toSignIn}
                </span>
              </div>
            </div>
          </Form>
        );
      }}
    />
  );
};

export default SignUpForm;
