import Button from '@components/Button/Button';
import FieldTextInput from '@components/FieldTextInput/FieldTextInput';
import Form from '@components/Form/Form';
import {
  composeValidators,
  emailFormatValid,
  required,
} from '@utils/validators';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import type { ReactNode } from 'react';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import css from './PasswordRecoveryForm.module.scss';

type TPasswordRecoveryFormProps = {
  initialValues?: Record<string, any>;
  rootClassName?: string;
  className?: string;
  formId?: string;
  onSubmit: (values: Record<string, any>) => void;
  inProgress: boolean;
  recoveryError?: ReactNode;
};

const PasswordRecoveryForm: React.FC<TPasswordRecoveryFormProps> = (props) => {
  const { inProgress, recoveryError, ...restProps } = props;
  const intl = useIntl();
  const router = useRouter();

  const formTitle = intl.formatMessage({
    id: 'PasswordRecoveryForm.title',
  });

  const formDescription = intl.formatMessage({
    id: 'PasswordRecoveryForm.description',
  });

  const emailPlaceholder = intl.formatMessage({
    id: 'PasswordRecoveryForm.email.placeholder',
  });

  const submitButtonText = intl.formatMessage({
    id: 'PasswordRecoveryForm.submitButtonText',
  });

  const goBackText = intl.formatMessage({
    id: 'PasswordRecoveryForm.goBack',
  });
  const toSignInText = intl.formatMessage({
    id: 'PasswordRecoveryForm.toSignInText',
  });

  const emailValidators = composeValidators(
    required(intl.formatMessage({ id: 'PasswordRecoveryForm.email.required' })),
    emailFormatValid(
      intl.formatMessage({ id: 'PasswordRecoveryForm.email.invalid' }),
    ),
  );

  const navigateToSignInPage = () => {
    router.push('/dang-nhap');
  };

  return (
    <FinalForm
      {...restProps}
      render={(formRenderProps: any) => {
        const { rootClassName, className, formId, handleSubmit, invalid } =
          formRenderProps;
        const submitDisable = invalid || inProgress;

        const classes = classNames(rootClassName || css.root, className);

        return (
          <Form className={classes} onSubmit={handleSubmit}>
            <div className={css.formContainer}>
              <div className={css.formTitleContainer}>
                <h2 className={css.formTitle}>{formTitle}</h2>
                <div className={css.formDescription}>{formDescription}</div>
              </div>

              <FieldTextInput
                id={formId ? `${formId}.email` : 'email'}
                name="email"
                placeholder={emailPlaceholder}
                validate={emailValidators}
              />

              {recoveryError && (
                <div className={css.error}>{recoveryError}</div>
              )}
              <Button
                inProgress={inProgress}
                className={css.submitButton}
                type="submit"
                disabled={submitDisable}>
                {submitButtonText}
              </Button>
            </div>
            <div className={css.toSignIn}>
              <div>
                {goBackText}{' '}
                <span
                  className={css.toSignInText}
                  onClick={navigateToSignInPage}>
                  {toSignInText}
                </span>
              </div>
            </div>
          </Form>
        );
      }}
    />
  );
};

export default PasswordRecoveryForm;
