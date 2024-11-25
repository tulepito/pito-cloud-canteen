import { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

import { useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { passwordThunks } from '@redux/slices/password.slice';
import type { AppDispatch } from '@redux/store';
import type { TObject } from '@utils/types';

import PasswordRecoveryForm from './PasswordRecoveryForm';

const PasswordRecoverPage = () => {
  const initialEmail = useAppSelector((state) => state.auth.tempEmail);
  const { value: isLoading, setValue: setIsLoading } = useBoolean();
  const { value: firstTimeSent, setValue: setFirstTimeSent } = useBoolean();
  const [timeLeft, setTimeLeft] = useState(0);
  const dispatch = useDispatch<AppDispatch>();
  const interval = useRef<any>(null);

  useEffect(() => {
    if (timeLeft === 0) {
      setIsLoading(false);

      clearInterval(interval.current);
    }
  }, [setIsLoading, timeLeft]);

  const handleSubmitRecoverPasswordForm = (values: TObject) => {
    setIsLoading(true);
    setTimeLeft(5);
    interval.current = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    setFirstTimeSent(true);
    dispatch(passwordThunks.recoverPassword(values));
  };

  const intl = useIntl();

  return (
    <PasswordRecoveryForm
      initialValues={{ email: initialEmail ?? '' }}
      timeLeft={timeLeft}
      onSubmit={handleSubmitRecoverPasswordForm}
      inProgress={isLoading}
      submitButtonText={
        firstTimeSent
          ? intl.formatMessage({
              id: 'PasswordRecoveryForm.resubmitButtonText',
            })
          : intl.formatMessage({
              id: 'PasswordRecoveryForm.submitButtonText',
            })
      }
    />
  );
};

export default PasswordRecoverPage;
