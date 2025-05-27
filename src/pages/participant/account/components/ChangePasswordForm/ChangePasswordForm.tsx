import { useField, useForm } from 'react-final-form-hooks';
import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import Form from '@components/Form/Form';
import { FieldPasswordInputComponent } from '@components/FormFields/FieldPasswordInput/FieldPasswordInput';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { passwordActions } from '@redux/slices/password.slice';
import { generalPaths } from '@src/paths';
import { passwordFormatValid } from '@src/utils/validators';

import css from './ChangePasswordForm.module.scss';

export type TChangePasswordFormValues = {
  password: string;
  newPassword: string;
  confirmPassword: string;
};

type TChangePasswordFormProps = {
  onSubmit: (values: TChangePasswordFormValues) => void;
  initialValues: TChangePasswordFormValues;
  inProgress: boolean;
};

const validate = (values: TChangePasswordFormValues) => {
  const errors: any = {};
  if (!values.password) {
    errors.password = 'Vui lòng nhập mật khẩu.';
  }
  if (!values.newPassword) {
    errors.newPassword = 'Vui lòng nhập mật khẩu mới.';
  }

  errors.newPassword =
    passwordFormatValid(
      'Mật khẩu phải từ 8-16 kí tự, bao gồm chữ cái in hoa, chữ cái in thường, ký tự đặc biệt và chữ số.',
    )(values.newPassword) || undefined;

  if (!values.confirmPassword) {
    errors.name = 'Vui lòng nhập xác nhận mật khẩu.';
  }
  if (
    values.newPassword &&
    values.confirmPassword &&
    values.newPassword !== values.confirmPassword
  ) {
    errors.confirmPassword =
      'Mật khẩu và xác nhận mật khẩu cần phải giống nhau.';
  }

  return errors;
};

const ChangePasswordForm: React.FC<TChangePasswordFormProps> = ({
  onSubmit,
  initialValues,
  inProgress,
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const changePasswordError = useAppSelector(
    (state) => state.password.changePasswordError,
  );

  const { form, handleSubmit, submitting, hasValidationErrors } =
    useForm<TChangePasswordFormValues>({
      onSubmit,
      validate,
      initialValues,
    });
  const intl = useIntl();

  const handleAnyFieldChange = () => {
    dispatch(passwordActions.clearChangePasswordError());
  };

  const password = useField('password', form);
  const newPassword = useField('newPassword', form);
  const confirmPassword = useField('confirmPassword', form);

  const passwordInput = {
    ...password.input,
    onChange: (e: any) => {
      password.input.onChange(e);
      handleAnyFieldChange();
    },
  };
  const newPasswordInput = {
    ...newPassword.input,
    onChange: (e: any) => {
      newPassword.input.onChange(e);
      handleAnyFieldChange();
    },
  };
  const confirmPasswordInput = {
    ...confirmPassword.input,
    onChange: (e: any) => {
      confirmPassword.input.onChange(e);
      handleAnyFieldChange();
    },
  };

  const disabledSubmit = submitting || hasValidationErrors || inProgress;

  const navigateToPasswordRecoverPage = () => {
    router.push(generalPaths.RecoveryPassword);
  };

  return (
    <Form onSubmit={handleSubmit} className={css.root}>
      <div className={css.header}>
        {intl.formatMessage({
          id: 'ParticipantChangePasswordRoute.description',
        })}
      </div>
      <div className={css.formContainer}>
        <div className={css.fieldsContainer}>
          <div className={css.fieldWrapper}>
            <FieldPasswordInputComponent
              id={`password`}
              name="password"
              label={intl.formatMessage({ id: 'mat-khau-hien-tai' })}
              input={passwordInput}
              meta={password.meta}
              placeholder={intl.formatMessage({ id: 'nhap-mat-khau-hien-tai' })}
              className={css.fieldInput}
            />
            <div className={css.forgotPassword}>
              <span onClick={navigateToPasswordRecoverPage}>
                {intl.formatMessage({ id: 'SignInForm.forgotPassword' })}
              </span>
            </div>
          </div>
          <div className={css.fieldWrapper}>
            <FieldPasswordInputComponent
              id={`newPassword`}
              name="newPassword"
              label={intl.formatMessage({ id: 'mat-khau-moi' })}
              input={newPasswordInput}
              meta={newPassword.meta}
              placeholder={intl.formatMessage({ id: 'nhap-mat-khau-moi' })}
              className={css.fieldInput}
            />
          </div>
          <div className={css.fieldWrapper}>
            <FieldPasswordInputComponent
              id={`confirmPassword`}
              name="confirmPassword"
              label={intl.formatMessage({ id: 'xac-nhan-mat-khau-moi' })}
              input={confirmPasswordInput}
              meta={confirmPassword.meta}
              placeholder={intl.formatMessage({
                id: 'xac-nhan-mat-khau-moi-0',
              })}
              className={css.fieldInput}
            />
          </div>

          <RenderWhen condition={changePasswordError !== null}>
            <ErrorMessage
              message={intl.formatMessage({
                id: 'mat-khau-hien-tai-chua-dung',
              })}
            />
          </RenderWhen>
        </div>

        <Button
          type="submit"
          disabled={disabledSubmit}
          inProgress={inProgress}
          className={css.submitBtn}>
          {intl.formatMessage({ id: 'AddOrderForm.moibleSubmitButtonText' })}
        </Button>
      </div>
    </Form>
  );
};

export default ChangePasswordForm;
