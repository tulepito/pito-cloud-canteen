import { denormalisedResponseEntities } from '@services/data';
import { fetchUser, fetchUserByEmail } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/sdk';
import { UserPermission } from '@src/types/UserPermission';
import { User } from '@src/utils/data';

import isBookerInOrderProgress from './isBookerInOrderProgress.service';

export type TChangeOwnerParams = {
  companyId: string;
  newOwnerEmail: string;
  permissionForOldOwner?: UserPermission;
  newOwnerProfileImageId?: string;
};

const transferCompanyOwner = async ({
  companyId,
  newOwnerEmail,
  permissionForOldOwner,
  newOwnerProfileImageId,
}: TChangeOwnerParams) => {
  if (!companyId || !newOwnerEmail) {
    throw new Error('Missing required params');
  }

  const integrationSdk = getIntegrationSdk();
  const companyAccount = await fetchUser(companyId);
  const {
    members = {},
    status,
    userState,
    nutritions,
    favoriteRestaurantList,
    favoriteFoodList,
    groups,
    groupList,
  } = User(companyAccount).getMetadata();

  const { tax, subAccountId, bankAccounts } =
    User(companyAccount).getPrivateData();

  const { companyEmail, companyLocation, companyName, note, phoneNumber } =
    User(companyAccount).getPublicData();

  const newCompanyAccount = await fetchUserByEmail(newOwnerEmail);

  await isBookerInOrderProgress({ members, memberEmail: newOwnerEmail });

  const {
    companyList: companyListOfNewCompany,
    company: prevCompanyObjOfNewCompany,
  } = User(newCompanyAccount).getMetadata();

  if (!newCompanyAccount) {
    throw new Error('User not found');
  }

  const newMembers = Object.keys(members).reduce((acc, key) => {
    const memberList: any = { ...acc };

    if (memberList[key].permission === UserPermission.OWNER) {
      memberList[key] = {
        ...members[key],
        permission: permissionForOldOwner || UserPermission.PARTICIPANT,
      };
    } else if (key === newOwnerEmail) {
      memberList[key] = {
        ...members[key],
        permission: UserPermission.OWNER,
      };
    } else {
      memberList[key] = members[key];
    }

    return memberList;
  }, members);
  const newOwnerCompanyList = companyListOfNewCompany.map((id: string) =>
    id === companyId ? User(newCompanyAccount).getId() : id,
  );

  const newCompanyObjOfNewCompany = Object.keys(
    prevCompanyObjOfNewCompany,
  ).reduce((acc, cur) => {
    let newCompanyData = { ...acc } as any;
    if (cur === companyId) {
      // replace old company id with new company id
      newCompanyData = {
        ...newCompanyData,
        [User(newCompanyAccount).getId()]: {
          ...(newCompanyData[cur] || {}),
          permission: UserPermission.OWNER,
        },
      };
      delete newCompanyData[cur];
    }

    return newCompanyData;
  }, prevCompanyObjOfNewCompany);

  // Update new member data to new company ( owner )
  const newCompanyResponse = await integrationSdk.users.updateProfile(
    {
      id: User(newCompanyAccount).getId(),
      ...(newOwnerProfileImageId
        ? { profileImageId: newOwnerProfileImageId }
        : {}),
      publicData: {
        companyEmail,
        companyLocation,
        companyName,
        note,
        phoneNumber,
        nutritions,
        favoriteRestaurantList,
        favoriteFoodList,
      },
      privateData: {
        tax,
        subAccountId,
        bankAccounts,
      },
      metadata: {
        id: User(newCompanyAccount).getId(),
        isCompany: true,
        members: newMembers,
        groups,
        groupList,
        status,
        userState,
        companyList: newOwnerCompanyList,
        company: newCompanyObjOfNewCompany,
      },
    },
    {
      include: ['profileImage'],
      expand: true,
    },
  );

  // Update all members company list with new company id
  Promise.all(
    Object.keys(newMembers).map(async (key) => {
      const member = newMembers[key as keyof typeof newMembers];
      const { id, permission } = member;

      // if owner dont need to update because it already updated above;
      if (permission === UserPermission.OWNER) return;

      const memberAccount = await fetchUser(id);

      const { companyList: memberCompanyList = [], company = {} } =
        User(memberAccount).getMetadata();

      const newMetaCompanyData = Object.keys(company).reduce((acc, cur) => {
        let newCompanyData = { ...acc } as any;
        if (cur === companyId) {
          // replace old company id with new company id
          newCompanyData = {
            ...newCompanyData,
            [User(newCompanyAccount).getId()]: {
              ...(newCompanyData[cur] || {}),
              permission: permissionForOldOwner || UserPermission.PARTICIPANT,
            },
          };
          delete newCompanyData[cur];
        }

        return newCompanyData;
      }, company);

      const newMemberCompanyList = memberCompanyList.map(
        (memberCompanyId: string) =>
          memberCompanyId === companyId
            ? User(newCompanyAccount).getId()
            : memberCompanyId,
      );

      const isOldCompany = id === companyId;

      await integrationSdk.users.updateProfile({
        id,
        privateData: {
          ...(isOldCompany ? { subAccountId: '' } : {}),
          ...(isOldCompany ? { tax: '' } : {}),
          ...(isOldCompany ? { bankAccounts: [] } : {}),
        },
        metadata: {
          ...(isOldCompany ? { isCompany: false } : {}),
          ...(isOldCompany ? { id: '' } : {}),
          ...(isOldCompany ? { members: {} } : {}),
          ...(isOldCompany ? { groups: [] } : {}),
          companyList: newMemberCompanyList,
          company: newMetaCompanyData,
        },
      });
    }),
  );

  const [updatedCompanyAccount] =
    denormalisedResponseEntities(newCompanyResponse);

  return updatedCompanyAccount;
};

export default transferCompanyOwner;
