import { useField, useForm } from 'react-final-form-hooks';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import FixedBottomButtons from '@components/FixedBottomButtons/FixedBottomButtons';
import Form from '@components/Form/Form';
import { FieldPasswordInputComponent } from '@components/FormFields/FieldPasswordInput/FieldPasswordInput';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppSelector } from '@hooks/reduxHooks';
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
  const changePasswordError = useAppSelector(
    (state) => state.ParticipantAccount.changePasswordError,
  );

  const { form, handleSubmit, submitting, hasValidationErrors } =
    useForm<TChangePasswordFormValues>({
      onSubmit,
      validate,
      initialValues,
    });

  const password = useField('password', form);
  const newPassword = useField('newPassword', form);
  const confirmPassword = useField('confirmPassword', form);
  const disabledSubmit = submitting || hasValidationErrors || inProgress;

  const navigateToPasswordRecoverPage = () => {
    router.push(generalPaths.RecoveryPassword);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div className={css.fieldWrapper}>
        <FieldPasswordInputComponent
          id={`password`}
          name="password"
          label="Mật khẩu hiện tại"
          input={password.input}
          meta={password.meta}
          className={css.fieldInput}
        />
        <div className={css.forgotPassword}>
          <span onClick={navigateToPasswordRecoverPage}>Quên mật khẩu?</span>
        </div>
      </div>
      <div className={css.fieldWrapper}>
        <FieldPasswordInputComponent
          id={`newPassword`}
          name="newPassword"
          label="Mật khẩu mới"
          input={newPassword.input}
          meta={newPassword.meta}
          className={css.fieldInput}
        />
      </div>
      <div className={css.fieldWrapper}>
        <FieldPasswordInputComponent
          id={`confirmPassword`}
          name="confirmPassword"
          label="Xác nhận mật khẩu mới"
          input={confirmPassword.input}
          meta={confirmPassword.meta}
          className={css.fieldInput}
        />
      </div>

      <RenderWhen condition={changePasswordError !== null}>
        <ErrorMessage message="Đổi mật khẩu không thành công, vui lòng kiểm tra và thử lại" />
      </RenderWhen>
      <FixedBottomButtons
        FirstButton={
          <Button
            type="submit"
            disabled={disabledSubmit}
            inProgress={inProgress}
            className={css.submitBtn}>
            Lưu thay đổi
          </Button>
        }
      />
    </Form>
  );
};

export default ChangePasswordForm;
