import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useRouter } from 'next/router';

import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import {
  useAppDispatch,
  useAppSelector,
  useAppSelectorFullStates,
} from '@hooks/reduxHooks';
import { emailVerificationThunks } from '@redux/slices/emailVerification.slice';
import { currentUserSelector } from '@redux/slices/user.slice';
import type { TObject } from '@utils/types';

import EmailVerificationForm from './EmailVerificationForm';

import css from './EmailVerification.module.scss';

const EmailVerificationPage = () => {
  const router = useRouter();
  const { query } = router;
  const { t: verificationTokenFromQuery } = query;
  const {
    emailVerification: { verificationInProgress, verificationError },
  } = useAppSelectorFullStates();
  const user = useAppSelector(currentUserSelector);
  const dispatch = useAppDispatch();

  const initialValues = {
    verificationToken: (verificationTokenFromQuery as string) || null,
  };

  const submitVerification = ({ verificationToken }: TObject) => {
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
          <LoadingContainer
            loadingText={
              <FormattedMessage id="EmailVerificationPage.loadingUserInformation" />
            }
          />
        )}
      </div>
    </div>
  );
};

export default EmailVerificationPage;
