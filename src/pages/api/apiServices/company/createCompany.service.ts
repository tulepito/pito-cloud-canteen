import CryptoJS from 'crypto-js';
import type { NextApiRequest, NextApiResponse } from 'next';

import { generateUncountableIdForSubAccount } from '@helpers/generateUncountableId';
import { denormalisedResponseEntities } from '@services/data';
import { fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk, getSdk } from '@services/sdk';
import { UserInviteStatus } from '@src/types/UserPermission';
import { User } from '@src/utils/data';
import { buildFullName } from '@src/utils/emailTemplate/participantOrderPicking';
import { ECompanyPermission, ECompanyStates } from '@src/utils/enums';
import type { TCreateCompanyApiParams, TObject } from '@src/utils/types';

const { SUB_ACCOUNT_EMAIL = 'pitocloudcanteen@gmail.com', PITO_ADMIN_ID } =
  process.env;

const normalizeCreateCompanyParams = (dataParams: TCreateCompanyApiParams) => {
  const {
    password,
    email,
    firstName,
    lastName,
    companyEmail,
    companyLocation,
    companyName,
    phoneNumber,
    location,
    note,
    tax,
  } = dataParams;

  const { selectedPlace } = location || {};

  const address = selectedPlace?.address;
  const origin = selectedPlace?.origin || {};

  const { selectedPlace: companySelectedPlace } = companyLocation || {};
  const companyAddress = companySelectedPlace?.address;
  const companyOrigin = companySelectedPlace?.origin || {};
  const createParams = {
    password,
    email,
    firstName,
    lastName,
    displayName: buildFullName(firstName, lastName),
    publicData: {
      phoneNumber,
      companyEmail,
      companyName,
      note,
      location: {
        address,
        origin: {
          lat: origin.lat,
          lng: origin.lng,
        },
      },
      companyLocation: {
        address: companyAddress,
        origin: {
          lat: companyOrigin.lat,
          lng: companyOrigin.lng,
        },
      },
    },
    privateData: {
      tax,
    },
  };

  return createParams;
};

const createCompany = async ({
  req,
  res,
  dataParams,
  queryParams,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
  dataParams: TCreateCompanyApiParams;
  queryParams: TObject;
}) => {
  const sdk = getSdk(req, res);

  const integrationSdk = getIntegrationSdk();
  const createDataParams = normalizeCreateCompanyParams(dataParams);
  // Create company account
  const companyResponse = await sdk.currentUser.create(createDataParams, {
    expand: true,
  });

  const [companyAccount] = denormalisedResponseEntities(companyResponse);
  const companyEmail = User(companyAccount).getAttributes().email;

  // Create sub master account
  const admin = await fetchUser(PITO_ADMIN_ID as string);
  const adminUser = User(admin);
  const { subAccountIdNumber = 0 } = adminUser.getMetadata();
  const splittedEmail = SUB_ACCOUNT_EMAIL.split('@');
  const subAccountId = generateUncountableIdForSubAccount(subAccountIdNumber);
  integrationSdk.users.updateProfile({
    id: PITO_ADMIN_ID,
    metadata: {
      subAccountIdNumber: subAccountIdNumber + 1,
    },
  });
  const subResponse = await sdk.currentUser.create({
    firstName: `Sub account for ${companyAccount.id.uuid}`,
    lastName: ' ',
    email: `${splittedEmail[0]}+${subAccountId}@${splittedEmail[1]}`,
    password: dataParams.password,
  });

  const [subAccount] = denormalisedResponseEntities(subResponse);
  const members = {
    [companyEmail]: {
      id: companyAccount.id.uuid,
      email: companyEmail,
      permission: ECompanyPermission.owner,
      groups: [],
      inviteStatus: UserInviteStatus.ACCEPTED,
    },
  };

  // Add sub master account to master account
  const masterAccountAfterUpdateResponse =
    await integrationSdk.users.updateProfile(
      {
        id: companyAccount.id,
        privateData: {
          subAccountId: subAccount.id.uuid,
        },
        metadata: {
          id: companyAccount.id.uuid,
          isCompany: true,
          members,
          companyList: [companyAccount.id.uuid],
          userState: ECompanyStates.unactive,
          company: {
            [companyAccount.id.uuid]: {
              permission: ECompanyPermission.owner,
            },
          },
        },
      },
      queryParams,
    );

  const encryptedPassword = CryptoJS.AES.encrypt(
    dataParams.password,
    process.env.ENCRYPT_PASSWORD_SECRET_KEY,
  ).toString();

  // Update sub master account password
  await integrationSdk.users.updateProfile({
    id: subAccount.id,
    privateData: {
      accountPassword: encryptedPassword,
    },
  });

  return masterAccountAfterUpdateResponse;
};

export default createCompany;
