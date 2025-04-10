import {
  companyPaths,
  enGeneralPaths,
  personalPaths,
  quizPaths,
} from '@src/paths';

const HIDING_COMPANY_FEATURE_HEADER_PATHNAMES = [
  enGeneralPaths.company.booker.orders.new['[companyId]'].index('[companyId]'),
  companyPaths.EditDraftOrder,
  companyPaths.OrderSelectRestaurant,
  companyPaths.ManageOrderDetail,
  companyPaths.ManageOrderPicking,
  ...Object.values(quizPaths),
];

export const shouldShowFeatureHeader = (pathName: string) => {
  return !HIDING_COMPANY_FEATURE_HEADER_PATHNAMES.includes(pathName);
};

const HIDING_COMPANY_SIDE_BAR_PATHNAMES = [
  companyPaths.Home,
  enGeneralPaths.company.booker.orders.new['[companyId]'].index('[companyId]'),
  companyPaths.EditDraftOrder,
  companyPaths.OrderSelectRestaurant,
  companyPaths.ManageOrders,
  companyPaths.ManageOrderDetail,
  companyPaths.ManageOrderPicking,
  companyPaths.OrderRating,
  enGeneralPaths.company['[companyId]'].ratings.index('[companyId]'),
  ...Object.values(quizPaths),
];

export const shouldHideHeaderPathnames = [
  enGeneralPaths.company.booker.orders.new['[companyId]'].index('[companyId]'),
];

export const shouldShowCompanyNavBar = [
  companyPaths.Home,
  companyPaths.ManageOrders,
  enGeneralPaths.company.booker.orders.new['[companyId]'].index('[companyId]'),
  personalPaths.Account,
];

export const shouldShowSidebar = (pathName: string) => {
  return !HIDING_COMPANY_SIDE_BAR_PATHNAMES.includes(pathName);
};

const HIDING_COMPANY_FOOTER_PATHNAMES = [
  companyPaths.ManageOrderDetail,
  companyPaths.ManageOrderPicking,
];

export const shouldHideCompanyFooter = (pathName: string) => {
  return HIDING_COMPANY_FOOTER_PATHNAMES.includes(pathName);
};

const SHOW_COMPANY_MOBILE_HEADER_PATHNAMES = [companyPaths.Home];

export const shouldShowMobileCompanyHeader = (pathName: string) => {
  return SHOW_COMPANY_MOBILE_HEADER_PATHNAMES.includes(pathName);
};
