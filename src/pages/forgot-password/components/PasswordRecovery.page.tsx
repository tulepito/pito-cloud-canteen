import { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

import Button from '@components/Button/Button';
import { useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { passwordThunks } from '@redux/slices/password.slice';
import type { AppDispatch } from '@redux/store';
import type { TObject } from '@utils/types';

import PasswordRecoveryForm from './PasswordRecoveryForm';

const PasswordRecoverPage = () => {
  const initialEmail = useAppSelector((state) => state.auth.tempEmail);
  const recoveryInProgress = useAppSelector(
    (state) => state.password.recoveryInProgress,
  );
  const { value: firstTimeSent, setValue: setFirstTimeSent } = useBoolean();

  const [timeLeft, setTimeLeft] = useState(0);
  const dispatch = useDispatch<AppDispatch>();
  const interval = useRef<any>(null);

  const [view, setView] = useState<'form' | 'success'>('form');
  const sentEmail = useRef<string | null>(null);

  useEffect(() => {
    if (timeLeft === 0) {
      clearInterval(interval.current);
    }
  }, [timeLeft]);

  const handleSubmitRecoverPasswordForm = (values: TObject) => {
    setTimeLeft(20);
    interval.current = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    setFirstTimeSent(true);
    sentEmail.current = values.email;
    dispatch(passwordThunks.recoverPassword(values))
      .unwrap()
      .then(() => {
        setView('success');
      });
  };

  const intl = useIntl();

  return (
    <PasswordRecoveryForm
      initialValues={{ email: initialEmail ?? '' }}
      timeLeft={timeLeft}
      onSubmit={handleSubmitRecoverPasswordForm}
      inProgress={recoveryInProgress}
      submitButtonText={
        firstTimeSent
          ? intl.formatMessage({
              id: 'PasswordRecoveryForm.resubmitButtonText',
            })
          : intl.formatMessage({
              id: 'PasswordRecoveryForm.submitButtonText',
            })
      }
      view={view}
      changeEmailComponent={
        <Button variant="secondary" onClick={() => setView('form')}>
          Thay đổi email khác
        </Button>
      }
      successComponent={
        <div>
          <div>
            <h2 className="text-green-500 font-semibold text-lg text-center">
              Thành công
            </h2>
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-24 h-24 text-center mx-auto"
              src="https://cdn-icons-mp4.flaticon.com/512/10690/10690819.mp4"
            />

            <p className="m-0 text-center text-base mb-1 font-semibold px-2">
              Chúng tôi đã gửi email khôi phục mật khẩu qua email{' '}
              {sentEmail.current}.
            </p>
            <p className="m-0 text-center px-2 text-sm text-stone-500">
              Vui lòng truy cập ứng dụng email của bạn để tiếp tục.
            </p>
          </div>
        </div>
      }
    />
  );
};

export default PasswordRecoverPage;
