import CryptoJS from 'crypto-js';
import type { NextApiRequest, NextApiResponse } from 'next';

import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk, getSdk } from '@services/sdk';
import { UserInviteStatus, UserPermission } from '@src/types/UserPermission';
import { ECompanyStates } from '@src/utils/enums';
import type { TObject } from '@src/utils/types';

const createCompany = async ({
  req,
  res,
  dataParams,
  queryParams,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
  dataParams: TObject;
  queryParams: TObject;
}) => {
  const sdk = getSdk(req, res);

  const integrationSdk = getIntegrationSdk();
  const { metadata, ...dataParamsWithoutMetadata } = dataParams;
  // Create company account
  const companyResponse = await sdk.currentUser.create(
    dataParamsWithoutMetadata,
  );

  const [companyAccount] = denormalisedResponseEntities(companyResponse);
  // Create sub master account
  const splittedEmail = dataParams.email.split('@');
  const subResponse = await sdk.currentUser.create({
    firstName: `Sub account for ${companyAccount.id.uuid}`,
    lastName: ' ',
    email: `${splittedEmail[0]}+sub-user@${splittedEmail[1]}`,
    password: dataParams.password,
  });

  const [subAccount] = denormalisedResponseEntities(subResponse);

  const members = {
    [dataParams.email]: {
      id: companyAccount.id.uuid,
      email: dataParams.email,
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
          ...metadata,
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
