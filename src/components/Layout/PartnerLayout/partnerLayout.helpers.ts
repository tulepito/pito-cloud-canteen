import { partnerPaths } from '@src/paths';

const HIDING_PARTNER_HEADER_PATHNAMES = [
  partnerPaths.ManagePayments,
  partnerPaths.SubOrderDetail,
  partnerPaths.ManageOrders,
  partnerPaths.ManageFood,
  partnerPaths.ManageMenus,
  partnerPaths.CreateFood,
  partnerPaths.EditFood,
  partnerPaths.CreateMenu,
  partnerPaths.EditMenu,
  partnerPaths.ManageReviews,
];

export const shouldShowPartnerHeader = (pathName: string) => {
  return !HIDING_PARTNER_HEADER_PATHNAMES.includes(pathName);
};

const HIDING_PARTNER_NAV_BAR_PATHNAMES = [
  partnerPaths.CreateMenu,
  partnerPaths.EditMenu,
  partnerPaths.CreateFood,
  partnerPaths.EditFood,
  partnerPaths.SubOrderDetail,
];

export const shouldShowPartnerNavBar = (pathName: string) => {
  return !HIDING_PARTNER_NAV_BAR_PATHNAMES.includes(pathName);
};
