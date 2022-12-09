import FieldTextInput from '@components/FieldTextInput/FieldTextInput';
import Form from '@components/Form/Form';
import classNames from 'classnames';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import css from './SignUpForm.module.scss';

const SignUpForm = (props: any) => {
  const intl = useIntl();

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
  return (
    <FinalForm
      {...props}
      render={(formRenderProps: any) => {
        const { rootClassName, className, formId, handleSubmit } =
          formRenderProps;

        const classes = classNames(rootClassName || css.root, className);

        return (
          <Form className={classes} onSubmit={handleSubmit}>
            <div className={css.formContainer}>
              <h2 className={css.formTitle}>{formTitle}</h2>

              <FieldTextInput
                id={formId ? `${formId}.name` : 'name'}
                name="name"
                placeholder={namePlaceholder}
              />
              <FieldTextInput
                id={formId ? `${formId}.email` : 'email'}
                name="email"
                placeholder={emailPlaceholder}
              />
              <FieldTextInput
                id={formId ? `${formId}.password` : 'password'}
                name="password"
                placeholder={passwordPlaceholder}
              />
              <FieldTextInput
                id={formId ? `${formId}.confirmPassword` : 'confirmPassword'}
                name="confirmPassword"
                placeholder={confirmPasswordPlaceholder}
              />
              <FieldTextInput
                id={formId ? `${formId}.phoneNumber` : 'phoneNumber'}
                name="phoneNumber"
                placeholder={phoneNumberPlaceholder}
              />
              <div>
                {privacyPolicyPartA}
                <u className={css.privacyPolicyText}>{privacyPolicyPartB}</u>
              </div>
              <button className={css.submitButton} type="button">
                {submitButtonText}
              </button>
            </div>
            <div className={css.haveAccountContainer}>
              <div>
                {haveAnAccountText}{' '}
                <span className={css.toSignIn}> {toSignIn}</span>
              </div>
            </div>
          </Form>
        );
      }}
    />
  );
};

export default SignUpForm;
