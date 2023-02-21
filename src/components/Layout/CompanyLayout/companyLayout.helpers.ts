import { companyPaths } from '@src/paths';

export const shouldShowFeatureHeader = (pathName: string) => {
  const hideList = [
    companyPaths.CreateNewOrder,
    companyPaths.EditDraftOrder,
    companyPaths.OrderSelectRestaurant,
    companyPaths.ManageOrders,
    companyPaths.ManageOrderDetail,
  ];

  if (hideList.includes(pathName)) {
    return false;
  }

  return true;
};

export const shouldShowSidebar = (pathName: string) => {
  const hideList = [
    companyPaths.CreateNewOrder,
    companyPaths.EditDraftOrder,
    companyPaths.OrderSelectRestaurant,
    companyPaths.ManageOrders,
    companyPaths.ManageOrderDetail,
  ];

  if (hideList.includes(pathName)) {
    return false;
  }

  return true;
};
