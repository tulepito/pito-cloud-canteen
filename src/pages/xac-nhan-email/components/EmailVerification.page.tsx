import { emailVerificationThunks } from '@redux/slices/emailVerification.slice';
import type { AppDispatch, RootState } from '@redux/store';
import { ensureCurrentUser } from '@utils/data';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';

import css from './EmailVerification.module.scss';
import EmailVerificationForm from './EmailVerificationForm';

const EmailVerificationPage = () => {
  const router = useRouter();
  const { query } = router;
  const { t: verificationToken } = query;
  const { currentUser } = useSelector((state: RootState) => state.user);

  const { verificationInProgress, verificationError } = useSelector(
    (state: RootState) => state.emailVerification,
  );
  const dispatch = useDispatch<AppDispatch>();

  const initialValues = {
    verificationToken: verificationToken || null,
  };
  const user = ensureCurrentUser(currentUser);

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const submitVerification = ({ verificationToken }: Record<string, any>) => {
    dispatch(emailVerificationThunks.verify({ verificationToken }));
  };

  useEffect(() => {
    dispatch(emailVerificationThunks.verify({ verificationToken }));
  }, []);

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
