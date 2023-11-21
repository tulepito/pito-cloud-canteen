import type { TCompanyMembersByCompanyId } from '@redux/slices/companyMember.slice';
import { User } from '@utils/data';
import { ECompanyStates } from '@utils/enums';
import { removeAccents } from '@utils/string';
import type { TCompany } from '@utils/types';

export type TUpdateStatus = {
  id: string;
  userState: ECompanyStates;
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
  companyMembers?: TCompanyMembersByCompanyId | null,
) => {
  return companies.map((company) => {
    const companyUserGetter = User(company);

    const companyId = companyUserGetter.getId();
    const { email } = companyUserGetter.getAttributes();
    const { lastName = '', firstName = '' } = companyUserGetter.getProfile();
    const { userState } = companyUserGetter.getMetadata();
    const {
      companyLocation = {},
      companyName,
      phoneNumber,
    } = companyUserGetter.getPublicData();

    return {
      key: companyId,
      data: {
        userState,
        isDraft: userState === ECompanyStates.draft,
        id: companyId,
        displayName: `${lastName} ${firstName}`,
        phoneNumber,
        email,
        companyName,
        address: companyLocation?.address,
        ...(companyMembers ? { members: companyMembers[companyId] } : {}),
        ...extraData,
      },
    };
  });
};

const getCompanyName = (company: TCompany) => {
  return User(company).getPublicData()?.companyName?.toLowerCase() || '';
};

export const sortCompanies = (
  companies: TCompany[],
  isSortAZ: boolean = true,
) => {
  const coefficient = isSortAZ ? 1 : -1;

  return [...companies].sort((companyA, companyB) => {
    const companyAName = getCompanyName(companyA);
    const companyBName = getCompanyName(companyB);

    if (companyAName < companyBName) return -1 * coefficient;
    if (companyBName < companyAName) return 1 * coefficient;

    return 0;
  });
};
