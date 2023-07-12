import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import Link from 'next/link';

import Button from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import Form from '@components/Form/Form';
import FieldPasswordInput from '@components/FormFields/FieldPasswordInput/FieldPasswordInput';
import { generalPaths } from '@src/paths';
import { isChangePasswordWrongPassword } from '@src/utils/errors';
import {
  composeValidators,
  composeValidatorsWithAllValues,
  confirmPassword,
  passwordFormatValid,
  required,
} from '@src/utils/validators';

import css from './AdminAccountResetPasswordForm.module.scss';

export type TAdminAccountResetPasswordFormValues = {
  currentPassword: string;
  newPassword: string;
};

type TExtraProps = {
  inProgress: boolean;
  changePasswordError: any;
};
type TAdminAccountResetPasswordFormComponentProps =
  FormRenderProps<TAdminAccountResetPasswordFormValues> & Partial<TExtraProps>;
type TAdminAccountResetPasswordFormProps =
  FormProps<TAdminAccountResetPasswordFormValues> & TExtraProps;

const AdminAccountResetPasswordFormComponent: React.FC<
  TAdminAccountResetPasswordFormComponentProps
> = (props) => {
  const {
    handleSubmit,
    form,
    values,
    invalid,
    inProgress,
    changePasswordError,
  } = props;

  const recoveryLink = (
    <Link href={generalPaths.RecoveryPassword} className={css.recoveryLink}>
      Quên mật khẩu?
    </Link>
  );
  const customHandleSubmit = async (e: any) => {
    const result = await handleSubmit(e);
    if (result) {
      Object.keys(values).forEach((key, index) => {
        form.change(key as any, undefined);
        form.resetFieldState(key as any);
        if (index === Object.keys(values).length - 1) {
          form.restart();
        }
      });
    }
  };

  const passwordErrorText = isChangePasswordWrongPassword(
    changePasswordError,
  ) ? (
    <ErrorMessage message="Vui lòng kiểm tra lại mật khẩu hiện tại." />
  ) : null;

  const genericFailure = changePasswordError ? (
    <ErrorMessage message="Cập nhật mật khẩu không thành công" />
  ) : null;

  const buttonDisabled = invalid || inProgress;

  return (
    <Form className={css.form} onSubmit={customHandleSubmit}>
      <>
        <div className={css.currentPassword}>
          <FieldPasswordInput
            name="currentPassword"
            id="currentPassword"
            label="Mật khẩu hiển tại"
            placeholder="Nhập mật khẩu hiện tại"
            className={css.field}
            validate={composeValidators(
              required('Vui lòng xác nhập mật khẩu hiện tại'),
              passwordFormatValid(
                'Mật khẩu phải từ 8-16 kí tự, bao gồm chữ cái in hoa, chữ cái in thường, ký tự đặc biệt và chữ số',
              ),
            )}
          />
          {recoveryLink}
        </div>
        <FieldPasswordInput
          name="newPassword"
          autoComplete="new-password"
          id="newPassword"
          label="Mật khẩu mới"
          placeholder="Nhập mật khẩu mới"
          className={css.field}
          validate={composeValidators(
            required('Vui lòng nhập mật khẩu mới'),
            passwordFormatValid(
              'Mật khẩu phải từ 8-16 kí tự, bao gồm chữ cái in hoa, chữ cái in thường, ký tự đặc biệt và chữ số',
            ),
          )}
        />
        <FieldPasswordInput
          name="confirmNewPassword"
          id="confirmNewPassword"
          label="Xác nhận mật khẩu mới"
          placeholder="Xác nhận mật khẩu mới"
          className={css.field}
          validate={composeValidatorsWithAllValues(
            required('Vui lòng xác nhận mật khẩu'),
            confirmPassword('Mật khẩu không khớp', 'newPassword'),
          )}
        />
        {passwordErrorText || genericFailure}
        <Button
          disabled={buttonDisabled}
          inProgress={inProgress}
          className={css.button}>
          Lưu thay đổi
        </Button>
      </>
    </Form>
  );
};

const AdminAccountResetPasswordForm: React.FC<
  TAdminAccountResetPasswordFormProps
> = (props) => {
  return (
    <FinalForm {...props} component={AdminAccountResetPasswordFormComponent} />
  );
};

export default AdminAccountResetPasswordForm;
