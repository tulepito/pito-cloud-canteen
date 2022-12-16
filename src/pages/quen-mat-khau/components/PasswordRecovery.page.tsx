import { useAppSelector } from '@redux/reduxHooks';
import { passwordThunks } from '@redux/slices/password.slice';
import type { AppDispatch } from '@redux/store';
import { useDispatch } from 'react-redux';

import PasswordRecoveryForm from './PasswordRecoveryForm';

const PasswordRecoverPage = () => {
  const { initialEmail, recoveryInProgress } = useAppSelector(
    (state) => state.password,
  );
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmitRecoverPasswordForm = (values: Record<string, any>) => {
    dispatch(passwordThunks.recoverPassword(values));
  };

  return (
    <PasswordRecoveryForm
      initialValues={{ email: initialEmail }}
      onSubmit={handleSubmitRecoverPasswordForm}
      inProgress={recoveryInProgress}
    />
  );
};

export default PasswordRecoverPage;
