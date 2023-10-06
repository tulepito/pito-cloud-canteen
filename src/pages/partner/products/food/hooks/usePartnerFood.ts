import useBoolean from '@hooks/useBoolean';

export const usePartnerFood = () => {
  const sendingApprovalToAdminModalController = useBoolean();

  return {
    sendingApprovalToAdminModalController,
  };
};
