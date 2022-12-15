import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import Link from 'next/link';
import React from 'react';
import { Field, Form as FinalForm } from 'react-final-form';
import { FormattedMessage } from 'react-intl';

import css from './EmailVerificationForm.module.scss';

type TEmailVerificationFormProps = {
  initialValues: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void;
  currentUser: any;
  inProgress: boolean;
  verificationError: any;
};

const EmailVerificationForm: React.FC<TEmailVerificationFormProps> = (
  props,
) => {
  const { currentUser, inProgress, verificationError, ...restProps } = props;
  const { email, emailVerified, pendingEmail, profile } =
    currentUser.attributes;
  const emailToVerify = <strong>{pendingEmail || email}</strong>;
  const name = profile.firstName;

  return (
    <FinalForm
      {...restProps}
      render={(formRenderProps) => {
        const { handleSubmit } = formRenderProps;

        const errorMessage = (
          <div className={css.error}>
            <FormattedMessage id="EmailVerificationForm.verificationFailed" />
          </div>
        );

        const submitInProgress = inProgress;
        const submitDisabled = submitInProgress;

        const verifyEmail = (
          <div className={css.root}>
            <div>
              <h2 className={css.modalTitle}>
                <FormattedMessage id="EmailVerificationForm.verifyEmailAddress" />
              </h2>

              <p className={css.modalMessage}>
                <FormattedMessage
                  id="EmailVerificationForm.finishAccountSetup"
                  values={{ email: emailToVerify }}
                />
              </p>

              {verificationError ? errorMessage : null}
            </div>

            <Form onSubmit={handleSubmit}>
              <Field component="input" type="hidden" name="verificationToken" />

              <div className={css.bottomWrapper}>
                <Button
                  type="submit"
                  inProgress={submitInProgress}
                  disabled={submitDisabled}>
                  {inProgress ? (
                    <FormattedMessage id="EmailVerificationForm.verifying" />
                  ) : (
                    <FormattedMessage id="EmailVerificationForm.verify" />
                  )}
                </Button>
              </div>
            </Form>
          </div>
        );

        const alreadyVerified = (
          <div className={css.root}>
            <div>
              <h2 className={css.modalTitle}>
                <FormattedMessage
                  id="EmailVerificationForm.successTitle"
                  values={{ name }}
                />
              </h2>

              <p className={css.modalMessage}>
                <FormattedMessage id="EmailVerificationForm.successText" />
              </p>
            </div>

            <div className={css.bottomWrapper}>
              <Link className={css.submitButton} href="/">
                <FormattedMessage id="EmailVerificationForm.successButtonText" />
              </Link>
            </div>
          </div>
        );

        const currentEmail = <strong>{email}</strong>;
        const alreadyVerifiedButErrorReturned = (
          <div className={css.root}>
            <div>
              <h1 className={css.modalTitle}>
                <FormattedMessage
                  id="EmailVerificationForm.noPendingTitle"
                  values={{ name }}
                />
              </h1>

              <p className={css.modalMessage}>
                <FormattedMessage
                  id="EmailVerificationForm.noPendingText"
                  values={{ email: currentEmail, breakline: <br /> }}
                />
              </p>
            </div>

            <div className={css.bottomWrapper}>
              <Link className={css.submitButton} href="/">
                <FormattedMessage id="EmailVerificationForm.successButtonText" />
              </Link>
            </div>
          </div>
        );

        const anyPendingEmailHasBeenVerifiedForCurrentUser =
          emailVerified && !pendingEmail;
        // eslint-disable-next-line no-nested-ternary
        return anyPendingEmailHasBeenVerifiedForCurrentUser && verificationError
          ? alreadyVerifiedButErrorReturned
          : anyPendingEmailHasBeenVerifiedForCurrentUser
          ? alreadyVerified
          : verifyEmail;
      }}
    />
  );
};

export default EmailVerificationForm;
