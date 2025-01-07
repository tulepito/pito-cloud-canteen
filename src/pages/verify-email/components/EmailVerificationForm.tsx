import React from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Field, Form as FinalForm } from 'react-final-form';
import { FormattedMessage } from 'react-intl';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import PitoLogoV2 from '@components/PitoLogoV2/PitoLogoV2';
import { getItem } from '@helpers/localStorageHelpers';
import { participantPaths } from '@src/paths';
import { LOCAL_STORAGE_KEYS, QUERY_REFS } from '@src/utils/constants';
import { buildFullName } from '@src/utils/emailTemplate/participantOrderPicking';

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
  const { firstName, lastName, displayName } = currentUser.attributes.profile;
  const emailToVerify = <strong>{pendingEmail || email}</strong>;
  const router = useRouter();

  const errorMessage = (
    <div className={css.error}>
      <FormattedMessage id="EmailVerificationForm.verificationFailed" />
    </div>
  );

  const submitInProgress = inProgress;
  const submitDisabled = submitInProgress;

  const navigateToHomePageMaybe = () => {
    const _url = new URL(
      window.location.href,
      process.env.NEXT_PUBLIC_CANONICAL_URL,
    );
    const searchParamsRef = _url.searchParams.get('ref');

    if (searchParamsRef === QUERY_REFS.INVITATION_LINK) {
      const companyId = _url.searchParams.get('companyId');

      if (!companyId) return;

      router.push(participantPaths.invitation['[companyId]'].index(companyId));

      return;
    }

    const tempCompanyId = getItem(LOCAL_STORAGE_KEYS.TEMP_COMPANY_ID);

    const targetCompanyId = tempCompanyId;

    if (targetCompanyId) {
      router.push(
        participantPaths.invitation['[companyId]'].index(targetCompanyId),
      );
    } else {
      router.push(participantPaths.OrderList);
    }
  };

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
            values={{
              name: buildFullName(firstName, lastName, {
                compareToGetLongerWith: displayName,
              }),
            }}
          />
        </p>
        <div className={css.divider}></div>
        <Button onClick={navigateToHomePageMaybe}>
          <FormattedMessage id="EmailVerificationForm.successButtonText" />
        </Button>
      </div>
    </div>
  );

  const anyPendingEmailHasBeenVerifiedForCurrentUser =
    emailVerified && !pendingEmail;

  return anyPendingEmailHasBeenVerifiedForCurrentUser && verificationError
    ? alreadyVerifiedButErrorReturned
    : anyPendingEmailHasBeenVerifiedForCurrentUser
    ? alreadyVerifiedButErrorReturned
    : verifyEmail;
};
const EmailVerificationForm: React.FC<TEmailVerificationFormProps> = (
  props,
) => {
  return <FinalForm {...props} component={EmailVerificationFormComponent} />;
};
export default EmailVerificationForm;
