import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import { getItem } from '@helpers/localStorageHelpers';
import { companyInvitationThunks } from '@redux/slices/companyInvitation.slice';
import { userThunks } from '@redux/slices/user.slice';
import type { AppDispatch } from '@redux/store';
import { enGeneralPaths, participantPaths } from '@src/paths';
import { LOCAL_STORAGE_KEYS, QUERY_REFS } from '@src/utils/constants';
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
    const companyId = getItem(LOCAL_STORAGE_KEYS.INVITATION_COMPANY_ID);
    const tempCompanyId = getItem(LOCAL_STORAGE_KEYS.TEMP_COMPANY_ID);

    const targetCompanyId = companyId || tempCompanyId;

    if (targetCompanyId) {
      router.push(participantPaths.getInvitationPath(targetCompanyId));
    } else {
      router.push(participantPaths.OrderList);
    }
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

    const _fromUrl = new URL(
      fromUrl as string,
      process.env.NEXT_PUBLIC_CANONICAL_URL,
    );
    const searchParamsRef = _fromUrl.searchParams.get('ref');
    if (searchParamsRef === QUERY_REFS.INVITATION_LINK) {
      router.push(fromUrl as string);

      return;
    }

    if (isCompanyInvitation) {
      let companyId = null;

      if (isCompanyInvitation) {
        const invitationIndex = fromUrlExtracted.indexOf('invitation');
        companyId = fromUrlExtracted[invitationIndex + 1];
      }

      dispatch(
        companyInvitationThunks.responseToInvitation({
          companyId: companyId as string,
          response: 'accept',
          source: 'invitation-link',
        }),
      )
        .unwrap()
        .then(() => {
          router.push(enGeneralPaths.Auth);
        })
        .catch((error) => {
          toast.error(
            `Có lỗi xảy ra trong quá trình xác nhận: ${String(error)}`,
          );
        });
    }
  }, [dispatch, fromUrl, router]);

  return (
    <div className={css.root}>
      <div className={css.content}>
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
