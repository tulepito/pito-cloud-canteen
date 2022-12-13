import type { RootState } from '@redux/store';
import { useSelector } from 'react-redux';

import PasswordRecoveryForm from './PasswordRecoveryForm';

const PasswordRecoverPage = () => {
  const { recoveryInProgress } = useSelector(
    (state: RootState) => state.passwordRecovery,
  );
  const handleSubmitRecoverPasswordForm = () => {};

  return (
    <PasswordRecoveryForm
      initialValues={{}}
      onChange={() => {}}
      onSubmit={handleSubmitRecoverPasswordForm}
      inProgress={recoveryInProgress}
    />
  );
};

export default PasswordRecoverPage;
