import type { ReactNode } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import FixedBottomButtons from '@components/FixedBottomButtons/FixedBottomButtons';
import Form from '@components/Form/Form';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconArrowHead from '@components/Icons/IconArrowHead/IconArrowHead';
import IconMail from '@components/Icons/IconMail/IconMail';
import type { TDefaultProps } from '@utils/types';
import {
  composeValidators,
  emailFormatValid,
  required,
} from '@utils/validators';

import css from './PasswordRecoveryForm.module.scss';

export type TPasswordRecoveryFormValues = {
  email: string;
};

type TExtraProps = TDefaultProps & {
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
  const emailLabel = intl.formatMessage({
    id: 'PasswordRecoveryForm.email.label',
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

  const emailValidators = composeValidators(
    required(intl.formatMessage({ id: 'PasswordRecoveryForm.email.required' })),
    emailFormatValid(
      intl.formatMessage({ id: 'PasswordRecoveryForm.email.invalid' }),
    ),
  );

  const navigateToSignInPage = () => {
    router.back();
  };

  const { rootClassName, className, formId, handleSubmit, invalid } = props;
  const submitDisable = invalid || inProgress;

  const classes = classNames(rootClassName || css.root, className);

  return (
    <Form className={classes} onSubmit={handleSubmit}>
      <div className={css.formContainer}>
        <div className={css.goBackContainer} onClick={navigateToSignInPage}>
          <IconArrowHead direction="left" />
          <span className={css.goBack}></span>
          {goBackText}
        </div>
        <div className={css.formTitleContainer}>
          <div className={css.formTitle}>{formTitle}</div>
          <div className={css.formDescription}>{formDescription}</div>
        </div>

        <FieldTextInput
          id={formId ? `${formId}.email` : 'email'}
          name="email"
          placeholder={emailPlaceholder}
          validate={emailValidators}
          label={emailLabel}
          leftIcon={<IconMail />}
        />

        {recoveryError && <div className={css.error}>{recoveryError}</div>}
        <div className={css.desktopView}>
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
        <FixedBottomButtons
          FirstButton={
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
          }
        />
      </div>
    </Form>
  );
};

const PasswordRecoveryForm: React.FC<TPasswordRecoveryFormProps> = (props) => {
  return <FinalForm {...props} component={PasswordRecoveryFormComponent} />;
};

export default PasswordRecoveryForm;
