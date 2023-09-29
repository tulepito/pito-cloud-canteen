import { partnerPaths } from '@src/paths';

const HIDING_PARTNER_HEADER_PATHNAMES = [
  partnerPaths.ManagePayments,
  partnerPaths.ManageOrders,
  partnerPaths.ManageFood,
  partnerPaths.ManageMenus,
];

export const shouldShowPartnerHeader = (pathName: string) => {
  return !HIDING_PARTNER_HEADER_PATHNAMES.includes(pathName);
};
