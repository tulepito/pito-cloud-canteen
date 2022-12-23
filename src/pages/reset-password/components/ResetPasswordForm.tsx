import Button from '@components/Button/Button';
import FieldPasswordInput from '@components/FieldPasswordInput/FieldPasswordInput';
import Form from '@components/Form/Form';
import {
  composeValidators,
  passwordFormatValid,
  required,
} from '@utils/validators';
import classNames from 'classnames';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { FormattedMessage, useIntl } from 'react-intl';

import css from './ResetPasswordForm.module.scss';

export type TResetPasswordFormValues = {
  password: string;
};

type TExtraProps = {
  formId?: string;
  rootClassName?: string;
  className?: string;
  inProgress: boolean;
};
type TResetPasswordFormComponentProps =
  FormRenderProps<TResetPasswordFormValues> & Partial<TExtraProps>;
type TResetPasswordFormProps = FormProps<TResetPasswordFormValues> &
  TExtraProps;

const ResetPasswordFormComponent: React.FC<TResetPasswordFormComponentProps> = (
  props,
) => {
  const intl = useIntl();
  const {
    rootClassName,
    className,
    formId,
    inProgress,
    submitting,
    handleSubmit,
    invalid,
  } = props;
  const classes = classNames(rootClassName || css.root, className);
  const submitInProgress = submitting || inProgress;
  const submitDisabled = invalid || submitInProgress;

  const passwordPlaceholder = intl.formatMessage({
    id: 'ResetPasswordForm.password.placeholder',
  });

  const passwordValidators = composeValidators(
    required(
      intl.formatMessage({
        id: 'ResetPasswordForm.password.required',
      }),
    ),
    passwordFormatValid(
      intl.formatMessage({
        id: 'ResetPasswordForm.password.invalid',
      }),
    ),
  );

  return (
    <Form className={classes} onSubmit={handleSubmit}>
      <FieldPasswordInput
        className={css.password}
        id={formId ? `${formId}.password` : 'password'}
        name="password"
        autoComplete="new-password"
        placeholder={passwordPlaceholder}
        validate={passwordValidators}
      />
      <Button
        className={css.submitButton}
        type="submit"
        inProgress={submitInProgress}
        disabled={submitDisabled}>
        <FormattedMessage id="ResetPasswordForm.submitButtonText" />
      </Button>
    </Form>
  );
};

const ResetPasswordForm: React.FC<TResetPasswordFormProps> = (props) => {
  return <FinalForm {...props} component={ResetPasswordFormComponent} />;
};

export default ResetPasswordForm;
