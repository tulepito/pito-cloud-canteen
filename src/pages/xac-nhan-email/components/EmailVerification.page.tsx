import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { emailVerificationThunks } from '@redux/slices/emailVerification.slice';
import { ensureCurrentUser } from '@utils/data';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import css from './EmailVerification.module.scss';
import EmailVerificationForm from './EmailVerificationForm';

const EmailVerificationPage = () => {
  const router = useRouter();
  const { query } = router;
  const { t: verificationTokenFromQuery } = query;
  const {
    emailVerification: { verificationInProgress, verificationError },
    user: { currentUser },
  } = useAppSelector((state) => state);
  const dispatch = useAppDispatch();

  const initialValues = {
    verificationToken: verificationTokenFromQuery || null,
  };
  const user = ensureCurrentUser(currentUser);

  const submitVerification = ({ verificationToken }: Record<string, any>) => {
    dispatch(
      emailVerificationThunks.verify({
        verificationToken,
      }),
    );
  };

  useEffect(() => {
    dispatch(
      emailVerificationThunks.verify({
        verificationToken: verificationTokenFromQuery,
      }),
    );
  }, [dispatch, verificationTokenFromQuery]);

  return (
    <div className={css.root}>
      <div className={css.content}>
        {user.id ? (
          <EmailVerificationForm
            initialValues={initialValues}
            onSubmit={submitVerification}
            currentUser={user}
            inProgress={verificationInProgress}
            verificationError={verificationError}
          />
        ) : (
          <FormattedMessage id="EmailVerificationPage.loadingUserInformation" />
        )}
      </div>
    </div>
  );
};

export default EmailVerificationPage;
