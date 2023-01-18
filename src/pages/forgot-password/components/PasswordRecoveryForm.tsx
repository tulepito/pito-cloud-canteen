import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import { generalPaths } from '@src/paths';
import {
  composeValidators,
  emailFormatValid,
  required,
} from '@utils/validators';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import type { ReactNode } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import css from './PasswordRecoveryForm.module.scss';

export type TPasswordRecoveryFormValues = {
  email: string;
};

type TExtraProps = {
  rootClassName?: string;
  className?: string;
  formId?: string;
  timeLeft: number;
  inProgress: boolean;
  recoveryError?: ReactNode;
};
type TPasswordRecoveryFormComponentProps =
  FormRenderProps<TPasswordRecoveryFormValues> & Partial<TExtraProps>;
type TPasswordRecoveryFormProps = FormProps<TPasswordRecoveryFormValues> &
  TExtraProps;

const PasswordRecoveryFormComponent: React.FC<
  TPasswordRecoveryFormComponentProps
> = (props) => {
  const { inProgress, recoveryError, timeLeft } = props;
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
  const submitButtonLoadingText = intl.formatMessage({
    id: 'PasswordRecoveryForm.submitButtonLoadingText',
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
    router.push(generalPaths.SignIn);
  };

  const { rootClassName, className, formId, handleSubmit, invalid } = props;
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

        {recoveryError && <div className={css.error}>{recoveryError}</div>}
        <Button
          className={css.submitButton}
          type="submit"
          disabled={submitDisable}>
          {inProgress ? (
            <>
              {submitButtonLoadingText}
              {timeLeft}
            </>
          ) : (
            <> {submitButtonText}</>
          )}
        </Button>
      </div>
      <div className={css.toSignIn}>
        <div>
          {goBackText}{' '}
          <span className={css.toSignInText} onClick={navigateToSignInPage}>
            {toSignInText}
          </span>
        </div>
      </div>
    </Form>
  );
};

const PasswordRecoveryForm: React.FC<TPasswordRecoveryFormProps> = (props) => {
  return <FinalForm {...props} component={PasswordRecoveryFormComponent} />;
};

export default PasswordRecoveryForm;
