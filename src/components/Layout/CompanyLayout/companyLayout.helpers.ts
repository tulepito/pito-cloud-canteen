import { companyPaths, quizPaths } from '@src/paths';

export const shouldShowFeatureHeader = (pathName: string) => {
  const hideList = [
    companyPaths.CreateNewOrder,
    companyPaths.EditDraftOrder,
    companyPaths.OrderSelectRestaurant,
    companyPaths.ManageOrderDetail,
    companyPaths.ManageOrderPicking,
    ...Object.values(quizPaths),
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
    companyPaths.ManageOrderPicking,
    companyPaths.OrderRating,
    ...Object.values(quizPaths),
  ];

  if (hideList.includes(pathName)) {
    return false;
  }

  return true;
};
