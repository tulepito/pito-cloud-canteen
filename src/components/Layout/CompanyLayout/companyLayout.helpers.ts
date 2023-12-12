import { companyPaths, quizPaths } from '@src/paths';

const HIDING_COMPANY_FEATURE_HEADER_PATHNAMES = [
  companyPaths.CreateNewOrder,
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
  companyPaths.CreateNewOrder,
  companyPaths.EditDraftOrder,
  companyPaths.OrderSelectRestaurant,
  companyPaths.ManageOrders,
  companyPaths.ManageOrderDetail,
  companyPaths.ManageOrderPicking,
  companyPaths.OrderRating,
  ...Object.values(quizPaths),
];

export const shouldHideHeaderPathnames = [companyPaths.CreateNewOrder];

export const shouldShowCompanyNavBar = [
  companyPaths.Home,
  companyPaths.ManageOrders,
  companyPaths.CreateNewOrder,
  companyPaths.Account,
];

export const shouldShowSidebar = (pathName: string) => {
  return !HIDING_COMPANY_SIDE_BAR_PATHNAMES.includes(pathName);
};
