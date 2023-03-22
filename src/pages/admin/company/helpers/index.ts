import type { TCompanyMembers } from '@redux/slices/ManageCompaniesPage.slice';
import { User } from '@utils/data';
import { ECompanyStatus } from '@utils/enums';
import { removeAccents } from '@utils/string';
import type { TCompany } from '@utils/types';

export type TUpdateStatus = {
  id: string;
  status: ECompanyStatus;
};

type TExtraDataMapToCompanyTable = {
  updateStatus: (e: TUpdateStatus) => void;
};

export const sliceCompanies = (
  companies: TCompany[],
  page: any,
  perPage: number,
) => {
  const pageAsNum = Number(page);

  return companies.slice((pageAsNum - 1) * perPage, pageAsNum * perPage);
};

export const filterCompanies = (companies: TCompany[], filterValues: any) => {
  const { keywords } = filterValues;

  if (Object.keys(filterValues).length === 0) return companies;

  return companies.filter((company) => {
    return (
      // eslint-disable-next-line no-nested-ternary
      removeAccents(User(company).getPublicData().companyName)
        ?.toLowerCase()
        .includes(removeAccents(keywords?.toLowerCase())) ||
      company.id.uuid?.toLowerCase().includes(keywords?.toLowerCase()) ||
      removeAccents(company.attributes.profile.publicData?.location?.address)
        ?.toLowerCase()
        .includes(removeAccents(keywords?.toLowerCase()))
    );
  });
};

export const filterCompaniesByCompanyName = (
  companies: TCompany[],
  companyName: string,
) => {
  return companies.filter((company: any) => {
    return (
      // eslint-disable-next-line no-nested-ternary
      companyName
        ? company.attributes.profile.publicData?.companyName
            ?.toLowerCase()
            .includes(companyName?.toLowerCase())
        : true
    );
  });
};

export const parseEntitiesToTableData = (
  companies: TCompany[],
  extraData: TExtraDataMapToCompanyTable,
  companyMembers?: TCompanyMembers | null,
) => {
  return companies.map((company) => {
    const { profile = {}, email } = company.attributes || {};
    const { displayName, publicData = {}, metadata = {} } = profile as any;
    const { status } = metadata;
    const { location = {}, companyName, phoneNumber } = publicData;

    return {
      key: company.id.uuid,
      data: {
        id: company.id.uuid,
        displayName,
        phoneNumber,
        email,
        companyName,
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
        User(a).getPublicData()?.companyName?.toLowerCase() <
        User(b).getPublicData()?.companyName?.toLowerCase()
      )
        return -1;
      if (
        User(a).getPublicData()?.companyName?.toLowerCase() >
        User(b).getPublicData()?.companyName?.toLowerCase()
      )
        return 1;

      return 0;
    }
    if (
      User(b).getPublicData()?.companyName?.toLowerCase() <
      User(a).getPublicData()?.companyName?.toLowerCase()
    )
      return -1;
    if (
      User(b).getPublicData()?.companyName?.toLowerCase() >
      User(a).getPublicData()?.companyName?.toLowerCase()
    )
      return 1;

    return 0;
  });
};
