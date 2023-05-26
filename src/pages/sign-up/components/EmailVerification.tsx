import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';

import { userThunks } from '@redux/slices/user.slice';
import type { AppDispatch } from '@redux/store';
import { generalPaths } from '@src/paths';
import { isTooManyEmailVerificationRequestsError } from '@utils/errors';

import css from './EmailVerification.module.scss';

type TEmailVerificationProps = {
  name: string;
  email: string;
  sendVerificationEmailError: any;
  inProgress: boolean;
};

const EmailVerification: React.FC<TEmailVerificationProps> = (props) => {
  const { name, email, sendVerificationEmailError, inProgress } = props;
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const {
    query: { from: fromUrl },
  } = router;

  const handleResendEmail = () => {
    dispatch(userThunks.sendVerificationEmail());
  };

  const navigateToHomePageMaybe = () => {
    router.push(fromUrl ? (fromUrl as string) : generalPaths.Home);
  };

  const resendEmailLink = (
    <span onClick={handleResendEmail} className={css.resendEmailLink}>
      <FormattedMessage id="EmailVerification.resendEmailLinkText" />
    </span>
  );

  const toHomePageLink = (
    <div className={css.toHomePageLink} onClick={navigateToHomePageMaybe}>
      <FormattedMessage id="EmailVerification.toHomePageLinkText" />
    </div>
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

  return (
    <div className={css.root}>
      <div className={css.content}>
        <h2 className={css.modalTitle}>
          <FormattedMessage
            id="EmailVerification.verifyEmailTitle"
            values={{ name: <span className={css.name}>{name}</span> }}
          />
        </h2>
        <div className={css.modalMessage}>
          <FormattedMessage
            id="EmailVerification.verifyEmailText"
            values={{ email }}
          />
        </div>
        {resendErrorMessage}
      </div>
      <div className={css.bottomWrapper}>
        <div className={css.modalHelperText}>
          {inProgress ? (
            <FormattedMessage id="EmailVerification.sendingEmail" />
          ) : (
            <div className={css.actions}>
              <div>
                <FormattedMessage
                  id="EmailVerification.resendEmail"
                  values={{ resendEmailLink }}
                />
              </div>

              {toHomePageLink}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
