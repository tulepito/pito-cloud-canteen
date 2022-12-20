import Button from '@components/Button/Button';
import FieldPasswordInput from '@components/FieldPasswordInput/FieldPasswordInput';
import Form from '@components/Form/Form';
import {
  composeValidators,
  passwordFormatValid,
  required,
} from '@utils/validators';
import classNames from 'classnames';
import { Form as FinalForm } from 'react-final-form';
import { FormattedMessage, useIntl } from 'react-intl';

import css from './ResetPasswordForm.module.scss';

type TResetPasswordFormProps = {
  formId?: string;
  rootClassName?: string;
  className?: string;
  onSubmit: (values: Record<string, any>) => void;
  inProgress: boolean;
};

const ResetPasswordForm: React.FC<TResetPasswordFormProps> = (props) => {
  const { rootClassName, className, formId, inProgress, ...restProps } = props;
  const intl = useIntl();
  const classes = classNames(rootClassName || css.root, className);

  return (
    <FinalForm
      {...restProps}
      render={(fieldRenderProps) => {
        const { handleSubmit, invalid } = fieldRenderProps;

        // password

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

        const submitInProgress = inProgress;
        const submitDisabled = invalid || submitInProgress;

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
      }}
    />
  );
};

export default ResetPasswordForm;
