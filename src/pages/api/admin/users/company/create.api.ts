/* eslint-disable no-console */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import cookies from '@services/cookie';
import {
  deserialize,
  getIntegrationSdk,
  getSdk,
  handleError,
} from '@services/sdk';
import { denormalisedResponseEntities } from '@utils/data';
import { ECompanyStatus } from '@utils/enums';
import bcrypt from 'bcryptjs';
import type { NextApiRequest, NextApiResponse } from 'next';

// SALT should be created ONE TIME upon sign up
const salt = bcrypt.genSaltSync(10);
// console.log(salt);
// example =>  $2a$10$CwTycUXWue0Thq9StjUM0u => to be added always to the password hash

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    if (
      req.headers['content-type'] === 'application/transit+json' &&
      typeof req.body === 'string'
    ) {
      try {
        req.body = deserialize(req.body);
      } catch (e) {
        console.error('Failed to parse request body as Transit:');
        console.error(e);
        res.status(400).send('Invalid Transit in request body.');
        return;
      }
    }
    const { dataParams, queryParams = {} } = req.body;

    const sdk = getSdk(req, res);

    const intergrationSdk = getIntegrationSdk();

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
      await intergrationSdk.users.updateProfile(
        {
          id: companyAccount.id,
          privateData: {
            subAccountId: subAccount.id.uuid,
          },
          metadata: {
            isCompanyAccount: true,
            status: ECompanyStatus.unactive,
          },
        },
        queryParams,
      );

    const hashedPassword = bcrypt.hashSync(dataParams.password, salt); // hash created previously created upon sign up

    // Update sub master account password
    await intergrationSdk.users.updateProfile({
      id: subAccount.id,
      privateData: {
        accountPassword: hashedPassword,
      },
    });

    res.json(masterAccountAfterUpdateResponse);
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(handler);
