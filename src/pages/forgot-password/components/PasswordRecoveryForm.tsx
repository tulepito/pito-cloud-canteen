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
  view?: 'form' | 'success';
  successComponent?: React.ReactNode;
  changeEmailComponent?: React.ReactNode;
};
type TPasswordRecoveryFormComponentProps =
  FormRenderProps<TPasswordRecoveryFormValues> & Partial<TExtraProps>;
type TPasswordRecoveryFormProps = FormProps<TPasswordRecoveryFormValues> &
  TExtraProps;

const PasswordRecoveryFormComponent: React.FC<
  TPasswordRecoveryFormComponentProps
> = (props) => {
  const {
    inProgress,
    timeLeft,
    submitButtonText,
    view,
    successComponent,
    changeEmailComponent,
  } = props;

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
          {view === 'success' && successComponent}

          {view === 'form' && (
            <>
              <div className="mt-2 mb-6">
                <div className="text-lg font-semibold m-0 text-center">
                  {formTitle}
                </div>

                {passwordRequested && timeLeft === 0 ? (
                  <div className="text-stone-600 text-sm m-0 text-center px-4">
                    {successMessageLineOne}
                  </div>
                ) : (
                  <div className="text-stone-600 text-sm m-0 text-center px-4">
                    {formDescription}
                  </div>
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
            </>
          )}

          {recoveryError && <div className={css.error}>{recoveryError}</div>}

          <div className="flex flex-col gap-4">
            <Button
              variant="primary"
              className={css.submitButton}
              type="submit"
              loadingMode="extend"
              inProgress={inProgress}
              disabled={invalid || inProgress || !!timeLeft}>
              {timeLeft ? (
                <>
                  {submitButtonLoadingText}
                  {timeLeft}
                </>
              ) : (
                <> {submitButtonText}</>
              )}
            </Button>

            {view === 'success' && changeEmailComponent}
          </div>
        </div>
      </Form>
    </div>
  );
};

const PasswordRecoveryForm: React.FC<TPasswordRecoveryFormProps> = (props) => {
  return <FinalForm {...props} component={PasswordRecoveryFormComponent} />;
};

export default PasswordRecoveryForm;
