import Button from '@components/Button/Button';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { passwordThunks } from '@redux/slices/password.slice';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import css from './ResetPassword.module.scss';
import ResetPasswordForm from './ResetPasswordForm';

const ResetPasswordPage = () => {
  const router = useRouter();
  const { t: token, e: email } = router.query;
  const paramsValid = !!(token && email);
  const { resetPasswordInProgress, resetPasswordError } = useAppSelector(
    (state) => state.password,
  );
  const dispatch = useAppDispatch();

  const [newPasswordSubmitted, setNewPswSubmitted] = useState(false);

  const handleSubmit = (values: Record<string, any>) => {
    const { password } = values;
    setNewPswSubmitted(false);
    dispatch(
      passwordThunks.resetPassword({
        email,
        passwordResetToken: token,
        newPassword: password,
      }),
    );

    setNewPswSubmitted(true);
  };

  const recoveryLink = (
    <Link href="/quen-mat-khau">
      <u>
        <FormattedMessage id="ResetPasswordPage.recoveryLinkText" />
      </u>
    </Link>
  );
  const paramsErrorContent = (
    <div className={css.content}>
      <p>
        <FormattedMessage
          id="ResetPasswordPage.invalidUrlParams"
          values={{ recoveryLink }}
        />
      </p>
    </div>
  );

  const resetFormContent = (
    <div className={css.content}>
      <h2 className={css.modalTitle}>
        <FormattedMessage id="ResetPasswordPage.mainHeading" />
      </h2>
      <p className={css.modalMessage}>
        <FormattedMessage id="ResetPasswordPage.helpText" />
      </p>
      {resetPasswordError ? (
        <p className={css.error}>
          <FormattedMessage id="ResetPasswordPage.resetFailed" />
        </p>
      ) : null}
      <ResetPasswordForm
        className={css.form}
        onSubmit={handleSubmit}
        inProgress={resetPasswordInProgress}
      />
    </div>
  );

  const resetDoneContent = (
    <div className={css.content}>
      <h2 className={css.modalTitle}>
        <FormattedMessage id="ResetPasswordPage.passwordChangedHeading" />
      </h2>
      <p className={css.modalMessage}>
        <FormattedMessage id="ResetPasswordPage.passwordChangedHelpText" />
      </p>
      <Link href="/dang-nhap" className={css.submitButton}>
        <Button className={css.loginButton}>
          <FormattedMessage id="ResetPasswordPage.loginButtonText" />
        </Button>
      </Link>
    </div>
  );

  let content;

  if (!paramsValid) {
    content = paramsErrorContent;
  } else if (!resetPasswordError && newPasswordSubmitted) {
    content = resetDoneContent;
  } else {
    content = resetFormContent;
  }

  return <div className={css.container}>{content}</div>;
};

export default ResetPasswordPage;
