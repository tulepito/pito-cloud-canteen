import CryptoJS from 'crypto-js';
import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import adminChecker from '@services/permissionChecker/admin';
import { getIntegrationSdk, getSdk, handleError } from '@services/sdk';
import { denormalisedResponseEntities } from '@utils/data';
import { ECompanyStatus } from '@utils/enums';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { dataParams, queryParams = {} } = req.body;

    const sdk = getSdk(req, res);

    const integrationSdk = getIntegrationSdk();

    // Create company account
    const companyResponse = await sdk.currentUser.create(dataParams);

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

    // Add sub master account to master account
    const masterAccountAfterUpdateResponse =
      await integrationSdk.users.updateProfile(
        {
          id: companyAccount.id,
          privateData: {
            subAccountId: subAccount.id.uuid,
          },
          metadata: {
            isCompany: true,
            status: ECompanyStatus.active,
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

    res.json(masterAccountAfterUpdateResponse);
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(adminChecker(handler));
