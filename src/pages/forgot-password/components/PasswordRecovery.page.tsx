import { useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { passwordThunks } from '@redux/slices/password.slice';
import type { AppDispatch } from '@redux/store';
import type { TObject } from '@utils/types';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import PasswordRecoveryForm from './PasswordRecoveryForm';

const PasswordRecoverPage = () => {
  const { initialEmail } = useAppSelector((state) => state.password);
  const { value: isLoading, setValue: setIsLoading } = useBoolean();
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

    dispatch(passwordThunks.recoverPassword(values));
  };

  return (
    <PasswordRecoveryForm
      initialValues={{ email: initialEmail as string }}
      timeLeft={timeLeft}
      onSubmit={handleSubmitRecoverPasswordForm}
      inProgress={isLoading}
    />
  );
};

export default PasswordRecoverPage;
