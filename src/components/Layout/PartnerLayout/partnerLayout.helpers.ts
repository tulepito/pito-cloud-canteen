import { partnerPaths } from '@src/paths';

export const shouldShowPartnerHeader = (pathName: string) => {
  const hideList = [partnerPaths.ManagePayments];

  if (hideList.includes(pathName)) {
    return false;
  }

  return true;
};
