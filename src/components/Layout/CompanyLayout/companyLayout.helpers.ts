import { companyPaths } from '@src/paths';

export const shouldShowFeatureHeader = (pathName: string) => {
  if (
    pathName === companyPaths.CreateNewOrder ||
    pathName === companyPaths.EditDraftOrder
  ) {
    return false;
  }

  return true;
};

export const shouldShowSidebar = (pathName: string) => {
  if (
    pathName === companyPaths.CreateNewOrder ||
    pathName === companyPaths.EditDraftOrder
  ) {
    return false;
  }

  return true;
};
