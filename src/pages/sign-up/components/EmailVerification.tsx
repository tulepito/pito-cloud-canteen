import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import PitoLogoV2 from '@components/PitoLogoV2/PitoLogoV2';
import { companyInvitationThunks } from '@redux/slices/companyInvitation.slice';
import { userThunks } from '@redux/slices/user.slice';
import type { AppDispatch } from '@redux/store';
import { enGeneralPaths } from '@src/paths';
import { isTooManyEmailVerificationRequestsError } from '@utils/errors';

import css from './EmailVerification.module.scss';

type TEmailVerificationProps = {
  name: string;
  email: string;
  sendVerificationEmailError: any;
  inProgress: boolean;
};

const EmailVerification: React.FC<TEmailVerificationProps> = (props) => {
  const { sendVerificationEmailError } = props;
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const {
    query: { from: fromUrl },
  } = router;

  const handleResendEmail = () => {
    dispatch(userThunks.sendVerificationEmail());
  };

  const navigateToHomePageMaybe = () => {
    router.push(fromUrl ? (fromUrl as string) : enGeneralPaths.Auth);
  };

  const resendEmailLink = (
    <span onClick={handleResendEmail} className={css.resendEmailLink}>
      <FormattedMessage id="EmailVerification.resendEmailLinkText" />
    </span>
  );

  const resendErrorTranslationId = isTooManyEmailVerificationRequestsError(
    sendVerificationEmailError,
  )
    ? 'EmailVerification.resendFailedTooManyRequests'
    : 'EmailVerification.resendFailed';

  const resendErrorMessage = sendVerificationEmailError ? (
    <p className={css.error}>
      <FormattedMessage id={resendErrorTranslationId} />
    </p>
  ) : null;

  useEffect(() => {
    const fromUrlExtracted = (fromUrl as string)?.split('/') || [];
    const isCompanyInvitation = fromUrlExtracted.includes('invitation');
    if (isCompanyInvitation) {
      const invitationIndex = fromUrlExtracted.indexOf('invitation');
      const companyId = fromUrlExtracted[invitationIndex + 1];
      dispatch(
        companyInvitationThunks.responseToInvitation({
          companyId: companyId as string,
          response: 'accept',
        }),
      );
    }
  }, [dispatch, fromUrl]);

  return (
    <div className={css.root}>
      <div className={css.content}>
        <PitoLogoV2 />
        <h2 className={css.modalTitle}>
          <FormattedMessage id="EmailVerification.verifyEmailTitle" />
        </h2>
        <div className={css.modalMessage}>
          <FormattedMessage
            id="EmailVerification.verifyEmailText"
            values={{ breakLine: <br /> }}
          />
        </div>
        {resendErrorMessage}
        <div className={css.divider}></div>
        <Button className={css.continueBtn} onClick={navigateToHomePageMaybe}>
          <FormattedMessage id="EmailVerificationForm.successButtonText" />
        </Button>
        <div className={css.modalMessage}>
          Không nhận được Email? Vui lòng kiểm tra hộp thư Spam Hoặc{' '}
        </div>
        {resendEmailLink}
      </div>
    </div>
  );
};

export default EmailVerification;
