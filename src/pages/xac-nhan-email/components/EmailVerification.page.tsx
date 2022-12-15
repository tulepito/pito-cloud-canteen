import { emailVerificationThunks } from '@redux/slices/emailVerification.slice';
import type { AppDispatch, RootState } from '@redux/store';
import { ensureCurrentUser } from '@utils/data';
import { parse } from '@utils/urlHelpers';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';

import css from './EmailVerification.module.scss';
import EmailVerificationForm from './EmailVerificationForm';

const parseVerificationToken = (search: any) => {
  const urlParams = parse(search);
  const verificationToken = urlParams.t;

  if (verificationToken) {
    return `${verificationToken}`;
  }

  return null;
};

const EmailVerificationPage = () => {
  const router = useRouter();
  const { query, isReady } = router;
  const { currentUser } = useSelector((state: RootState) => state.user);

  const { verificationInProgress, verificationError } = useSelector(
    (state: RootState) => state.emailVerification,
  );
  const dispatch = useDispatch<AppDispatch>();

  const initialValues = {
    verificationToken: parseVerificationToken(isReady ? query : null),
  };
  const user = ensureCurrentUser(currentUser);

  const submitVerification = ({ verificationToken }: Record<string, any>) => {
    dispatch(emailVerificationThunks.verify({ verificationToken }));
  };

  useEffect(() => {
    const verificationToken = parseVerificationToken(isReady ? query : null);
    console.log(verificationToken);

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
