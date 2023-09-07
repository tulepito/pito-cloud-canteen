import { partnerPaths } from '@src/paths';

const HIDING_PARTNER_HEADER_PATHNAMES = [partnerPaths.ManagePayments];

export const shouldShowPartnerHeader = (pathName: string) => {
  return !HIDING_PARTNER_HEADER_PATHNAMES.includes(pathName);
};
