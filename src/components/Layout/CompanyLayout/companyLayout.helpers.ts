import { companyPaths } from '@src/paths';

const PAGE_LIST = [
  companyPaths.CreateNewOrder,
  companyPaths.EditDraftOrder,
  companyPaths.OrderSelectRestaurant,
];

export const shouldShowFeatureHeader = (pathName: string) => {
  if (PAGE_LIST.includes(pathName)) {
    return false;
  }

  return true;
};
