import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconArrowHead from '@components/Icons/IconArrowHead/IconArrowHead';
import { useAppSelector } from '@hooks/reduxHooks';
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
  submitButtonText: string;
};
type TPasswordRecoveryFormComponentProps =
  FormRenderProps<TPasswordRecoveryFormValues> & Partial<TExtraProps>;
type TPasswordRecoveryFormProps = FormProps<TPasswordRecoveryFormValues> &
  TExtraProps;

const PasswordRecoveryFormComponent: React.FC<
  TPasswordRecoveryFormComponentProps
> = (props) => {
  const { inProgress, timeLeft, submitButtonText } = props;

  const intl = useIntl();
  const router = useRouter();
  const recoveryError = useAppSelector((state) => state.password.recoveryError);
  const passwordRequested = useAppSelector(
    (state) => state.password.passwordRequested,
  );

  const formTitle = intl.formatMessage({
    id: 'PasswordRecoveryForm.title',
  });

  const successMessageLineOne = intl.formatMessage({
    id: 'PasswordRecoveryForm.successMessageLineOne',
  });

  const successMessageLineTwo = intl.formatMessage({
    id: 'PasswordRecoveryForm.successMessageLineTwo',
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
    <div className={css.wrapper}>
      <div className={css.goBackContainer} onClick={navigateToSignInPage}>
        <IconArrowHead direction="left" />
        <span className={css.goBack}></span>
        {goBackText}
      </div>

      <Form className={classes} onSubmit={handleSubmit}>
        <div className={css.formContainer}>
          <div className={css.formTitleContainer}>
            <div className={css.formTitle}>{formTitle}</div>

            {passwordRequested && timeLeft === 0 ? (
              <div
                className={css.formDescription}
                style={{
                  textAlign: 'center',
                }}>
                <span
                  style={{
                    display: 'inline-block',
                  }}>
                  {successMessageLineOne}
                </span>
                <span
                  style={{
                    display: 'inline-block',
                  }}>
                  {successMessageLineTwo}
                </span>
              </div>
            ) : (
              <div className={css.formDescription}>{formDescription}</div>
            )}
          </div>

          <FieldTextInput
            id={formId ? `${formId}.email` : 'email'}
            name="email"
            placeholder={emailPlaceholder}
            validate={emailValidators}
            label={emailLabel}
            errorClass={css.errorClass}
          />

          {recoveryError && <div className={css.error}>{recoveryError}</div>}

          {/* <div className={css.desktopView}> */}
          <Button
            variant="primary"
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
          {/* </div> */}

          {/* <FixedBottomButtons
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
          /> */}
        </div>
      </Form>
    </div>
  );
};

const PasswordRecoveryForm: React.FC<TPasswordRecoveryFormProps> = (props) => {
  return <FinalForm {...props} component={PasswordRecoveryFormComponent} />;
};

export default PasswordRecoveryForm;
