import React from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Field, Form as FinalForm } from 'react-final-form';
import { FormattedMessage } from 'react-intl';
import Link from 'next/link';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import PitoLogoV2 from '@components/PitoLogoV2/PitoLogoV2';
import { enGeneralPaths } from '@src/paths';

import css from './EmailVerificationForm.module.scss';

export type TEmailVerificationFormValues = {
  verificationToken: string | null;
};

type TExtraProps = {
  currentUser: any;
  inProgress: boolean;
  verificationError: any;
};
type TEmailVerificationFormComponentProps =
  FormRenderProps<TEmailVerificationFormValues> & Partial<TExtraProps>;
type TEmailVerificationFormProps = FormProps<TEmailVerificationFormValues> &
  TExtraProps;

const EmailVerificationFormComponent: React.FC<
  TEmailVerificationFormComponentProps
> = (props) => {
  const { currentUser, inProgress, verificationError, handleSubmit } = props;
  const { email, emailVerified, pendingEmail } = currentUser.attributes;
  const { firstName, lastName } = currentUser.attributes.profile;
  const emailToVerify = <strong>{pendingEmail || email}</strong>;

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
      <div className={css.content}>
        <PitoLogoV2 />
        <h2 className={css.modalTitle}>
          <FormattedMessage id="EmailVerificationForm.noPendingTitle" />
        </h2>

        <p className={css.modalMessage}>
          <FormattedMessage
            id="EmailVerificationForm.noPendingText"
            values={{ name: `${lastName} ${firstName}` }}
          />
        </p>
        <div className={css.divider}></div>
        <Button>
          <Link className={css.submitButton} href={enGeneralPaths.Auth}>
            <FormattedMessage id="EmailVerificationForm.successButtonText" />
          </Link>
        </Button>
      </div>
    </div>
  );

  const alreadyVerifiedButErrorReturned = (
    <div className={css.root}>
      <div className={css.content}>
        <PitoLogoV2 />
        <h2 className={css.modalTitle}>
          <FormattedMessage id="EmailVerificationForm.noPendingTitle" />
        </h2>

        <p className={css.modalMessage}>
          <FormattedMessage
            id="EmailVerificationForm.noPendingText"
            values={{ name: `${lastName} ${firstName}` }}
          />
        </p>
        <div className={css.divider}></div>
        <Button>
          <Link className={css.submitButton} href={enGeneralPaths.Auth}>
            <FormattedMessage id="EmailVerificationForm.successButtonText" />
          </Link>
        </Button>
      </div>
    </div>
  );

  const anyPendingEmailHasBeenVerifiedForCurrentUser =
    emailVerified && !pendingEmail;

  return anyPendingEmailHasBeenVerifiedForCurrentUser && verificationError
    ? alreadyVerifiedButErrorReturned
    : anyPendingEmailHasBeenVerifiedForCurrentUser
    ? alreadyVerified
    : verifyEmail;
};

const EmailVerificationForm: React.FC<TEmailVerificationFormProps> = (
  props,
) => {
  return <FinalForm {...props} component={EmailVerificationFormComponent} />;
};

export default EmailVerificationForm;
