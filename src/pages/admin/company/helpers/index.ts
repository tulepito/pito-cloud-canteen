import type { TCompanyMembers } from '@redux/slices/ManageCompaniesPage.slice';
import { RESULT_PAGE_SIZE } from '@redux/slices/ManageCompaniesPage.slice';
import { USER } from '@utils/data';
import { ECompanyStatus } from '@utils/enums';
import type { TCompany } from '@utils/types';

export type TUpdateStatus = {
  id: string;
  status: ECompanyStatus;
};

type TExtraDataMapToCompanyTable = {
  updateStatus: (e: TUpdateStatus) => void;
};

export const sliceCompanies = (companies: TCompany[], page: any) => {
  const pageAsNum = Number(page);

  return companies.slice(
    (pageAsNum - 1) * RESULT_PAGE_SIZE,
    pageAsNum * RESULT_PAGE_SIZE,
  );
};

export const filterCompanies = (companies: TCompany[], filterValues: any) => {
  const {
    searchId,
    searchDisplayName,
    searchCompanyName,
    searchEmail,
    searchPhone,
    searchStatus,
  } = filterValues;

  if (Object.keys(filterValues).length === 0) return companies;
  return companies.filter((company: any) => {
    return (
      // eslint-disable-next-line no-nested-ternary
      (searchId ? company.id.uuid.includes(searchId) : true) &&
      (searchDisplayName
        ? company.attributes.profile?.displayName
            .toLowerCase()
            .includes(searchDisplayName.toLowerCase())
        : true) &&
      (searchCompanyName
        ? company.attributes.profile.publicData?.companyName
            ?.toLowerCase()
            .includes(searchCompanyName?.toLowerCase())
        : true) &&
      (searchEmail
        ? company.attributes.email
            ?.toLowerCase()
            .includes(searchEmail?.toLowerCase())
        : true) &&
      (searchPhone
        ? company.attributes.profile.publicData?.phoneNumber
            ?.toLowerCase()
            .includes(searchPhone?.toLowerCase())
        : true) &&
      (searchStatus
        ? company.attributes.profile.metadata?.status === Number(searchStatus)
        : true)
    );
  });
};

export const parseEntitiesToTableData = (
  companies: TCompany[],
  extraData: TExtraDataMapToCompanyTable,
  companyMembers?: TCompanyMembers | null,
) => {
  return companies.map((company) => {
    const { profile = {} } = company.attributes || {};
    const { displayName, publicData = {}, metadata = {} } = profile as any;
    const { status } = metadata;
    const { location = {} } = publicData;

    return {
      key: company.id.uuid,
      data: {
        id: company.id.uuid,
        name: displayName,
        address: location?.address,
        status: status || ECompanyStatus.unactive,
        ...(companyMembers ? { members: companyMembers[company.id.uuid] } : {}),
        ...extraData,
      },
    };
  });
};

export const sortCompanies = (
  companies: TCompany[],
  isSortAZ: boolean = true,
) => {
  return [...companies].sort((a, b) => {
    if (isSortAZ) {
      if (
        USER(a).getPublicData().companyName.toLowerCase() <
        USER(b).getPublicData().companyName.toLowerCase()
      )
        return -1;
      if (
        USER(a).getPublicData().companyName.toLowerCase() >
        USER(b).getPublicData().companyName.toLowerCase()
      )
        return 1;
      return 0;
    }
    if (
      USER(b).getPublicData().companyName.toLowerCase() <
      USER(a).getPublicData().companyName.toLowerCase()
    )
      return -1;
    if (
      USER(b).getPublicData().companyName.toLowerCase() >
      USER(a).getPublicData().companyName.toLowerCase()
    )
      return 1;
    return 0;
  });
};
