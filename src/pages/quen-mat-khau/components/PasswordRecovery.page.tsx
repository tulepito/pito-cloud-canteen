import { recoverPasswordThunks } from '@redux/slices/passwordRecovery.slice';
import type { AppDispatch, RootState } from '@redux/store';
import { useDispatch, useSelector } from 'react-redux';

import PasswordRecoveryForm from './PasswordRecoveryForm';

const PasswordRecoverPage = () => {
  const { initialEmail, recoveryInProgress } = useSelector(
    (state: RootState) => state.passwordRecovery,
  );
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmitRecoverPasswordForm = (values: Record<string, any>) => {
    dispatch(recoverPasswordThunks.recoverPassword(values));
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
