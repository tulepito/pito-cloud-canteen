import { partnerPaths } from '@src/paths';

const HIDING_PARTNER_HEADER_PATHNAMES = [
  partnerPaths.ManagePayments,
  partnerPaths.ManageOrders,
  partnerPaths.ManageFood,
  partnerPaths.ManageMenus,
  partnerPaths.CreateFood,
  partnerPaths.CreateMenu,
  partnerPaths.EditMenu,
];

export const shouldShowPartnerHeader = (pathName: string) => {
  return !HIDING_PARTNER_HEADER_PATHNAMES.includes(pathName);
};

const HIDING_PARTNER_NAV_BAR_PATHNAMES = [
  partnerPaths.CreateMenu,
  partnerPaths.CreateFood,
  partnerPaths.EditMenu,
];

export const shouldShowPartnerNavBar = (pathName: string) => {
  return !HIDING_PARTNER_NAV_BAR_PATHNAMES.includes(pathName);
};
