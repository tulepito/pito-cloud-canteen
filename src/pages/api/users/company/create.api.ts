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
import type { NextApiRequest, NextApiResponse } from 'next';

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

    // Create master account
    const masterResponse = await sdk.currentUser.create(dataParams);

    const [masterAccount] = denormalisedResponseEntities(masterResponse);

    // Create sub master account
    const splittedEmail = dataParams.email.split('@');
    const subResponse = await sdk.currentUser.create({
      firstName: `Sub account for ${masterAccount.id.uuid}`,
      lastName: ' ',
      email: `${splittedEmail[0]}+sub-user@${splittedEmail[1]}`,
    });

    const [subAccount] = denormalisedResponseEntities(subResponse);

    // Add sub master account to master account
    const masterAccountAfterUpdateResponse =
      await intergrationSdk.users.updateProfile(
        {
          id: masterAccount.id,
          privateData: {
            subAccountId: subAccount.id.uuid,
          },
          metadata: {
            isCompanyAccount: true,
          },
        },
        queryParams,
      );

    // Update sub master account user type and password
    await intergrationSdk.users.updateProfile({
      id: subAccount.id,
      privateData: {
        accountPassword: dataParams.password,
      },
    });

    res.json(masterAccountAfterUpdateResponse);
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(handler);
