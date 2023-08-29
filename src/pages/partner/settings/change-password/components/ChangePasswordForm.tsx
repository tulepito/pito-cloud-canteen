import { useField, useForm } from 'react-final-form-hooks';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import Form from '@components/Form/Form';
import { FieldPasswordInputComponent } from '@components/FormFields/FieldPasswordInput/FieldPasswordInput';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { useViewport } from '@hooks/useViewport';
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
  inProgress?: boolean;
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
  inProgress = false,
}) => {
  const router = useRouter();
  const { isMobileLayout } = useViewport();
  const dispatch = useAppDispatch();
  const changePasswordError = useAppSelector(
    (state) => state.ParticipantAccount.changePasswordError,
  );

  const { form, handleSubmit, submitting, hasValidationErrors } =
    useForm<TChangePasswordFormValues>({
      onSubmit,
      validate,
    });

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
        {isMobileLayout ? 'Đổi mật khẩu' : 'Cài đặt'}
      </div>

      <div className={css.subHeader}>Cài đặt mật khẩu</div>

      <div className={css.formContainer}>
        <div className={css.fieldsContainer}>
          <div className={css.fieldWrapper}>
            <FieldPasswordInputComponent
              id={`password`}
              name="password"
              label="Mật khẩu hiện tại"
              input={passwordInput}
              meta={password.meta}
              placeholder="Nhập mật khẩu hiện tại"
              className={css.fieldInput}
            />
            <div className={css.forgotPassword}>
              <span onClick={navigateToPasswordRecoverPage}>
                Quên mật khẩu?
              </span>
            </div>
          </div>
          <div className={css.fieldWrapper}>
            <FieldPasswordInputComponent
              id={`newPassword`}
              name="newPassword"
              label="Mật khẩu mới"
              input={newPasswordInput}
              meta={newPassword.meta}
              placeholder="Nhập mật khẩu mới"
              className={css.fieldInput}
            />
          </div>
          <div className={css.fieldWrapper}>
            <FieldPasswordInputComponent
              id={`confirmPassword`}
              name="confirmPassword"
              label="Xác nhận mật khẩu mới"
              input={confirmPasswordInput}
              meta={confirmPassword.meta}
              placeholder="Xác nhận mật khẩu mới"
              className={css.fieldInput}
            />
          </div>

          <RenderWhen condition={changePasswordError !== null}>
            <ErrorMessage message="Mật khẩu hiện tại chưa đúng" />
          </RenderWhen>
        </div>

        <div className={css.divider} />

        <Button
          type="submit"
          disabled={disabledSubmit}
          inProgress={inProgress}
          className={css.submitBtn}>
          Lưu thay đổi
        </Button>
      </div>
    </Form>
  );
};

export default ChangePasswordForm;
