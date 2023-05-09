import CryptoJS from 'crypto-js';
import type { NextApiRequest, NextApiResponse } from 'next';

import { denormalisedResponseEntities } from '@services/data';
import { emailSendingFactory, EmailTemplateTypes } from '@services/email';
import { getIntegrationSdk, getSdk } from '@services/sdk';
import { UserInviteStatus, UserPermission } from '@src/types/UserPermission';
import { User } from '@src/utils/data';
import { ECompanyStates } from '@src/utils/enums';
import type { TCreateCompanyApiParams, TObject } from '@src/utils/types';

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
    displayName: `${lastName} ${firstName}`,
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
  const companyId = companyAccount.id.uuid;

  // Create sub master account
  const splittedEmail = companyEmail.split('@');
  const subResponse = await sdk.currentUser.create({
    firstName: `Sub account for ${companyAccount.id.uuid}`,
    lastName: ' ',
    email: `${splittedEmail[0]}+sub-user@${splittedEmail[1]}`,
    password: dataParams.password,
  });

  const [subAccount] = denormalisedResponseEntities(subResponse);

  const members = {
    [companyEmail]: {
      id: companyAccount.id.uuid,
      email: companyEmail,
      permission: UserPermission.OWNER,
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
          userState: ECompanyStates.draft,
          company: {
            [companyAccount.id.uuid]: {
              permission: UserPermission.OWNER,
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

  await emailSendingFactory(EmailTemplateTypes.BOOKER.BOOKER_ACCOUNT_CREATED, {
    password: dataParams.password,
    companyId,
  });

  return masterAccountAfterUpdateResponse;
};

export default createCompany;
