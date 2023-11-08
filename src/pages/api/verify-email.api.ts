import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

import { composeApiCheckers, HttpMethod } from '@apis/configs';
import adminChecker from '@services/permissionChecker/admin';
import { handleError } from '@services/sdk';

const axiosInstance = axios.create({
  baseURL: process.env.FLEX_CONSOLE_INTERNAL_API_SERVER_URL,
  headers: {
    'Content-Type': 'application/transit+json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

const login = async () => {
  try {
    console.info(
      `Login Sharetribe Console - ${process.env.FLEX_CONSOLE_INTERNAL_API_SERVER_URL}/api/login`,
    );

    const loginResult = await axiosInstance.post(
      '/api/login',
      process.env.FLEX_CONSOLE_LOGIN_STRING,
    );
    const loginSuccess = loginResult.status === 200;

    if (!loginSuccess) {
      console.error('Login Sharetribe Console failed');
    }

    const [cookie] = loginResult?.headers['set-cookie'] || [];

    axiosInstance.defaults.headers.Cookie = cookie;
  } catch (err) {
    console.error('Login Sharetribe Console failed - catch -');
    console.error(err);
  }
};

const verifyEmail = async (userId: string) => {
  try {
    console.info(`Verifying email for user - ${userId}`);

    const response = await axiosInstance.post('/api/command', [
      '^ ',
      '~:command/name',
      '~:verify-email',
      '~:user/id',
      `~u${userId}`,
      '~:marketplace/ident',
      `~:${process.env.FLEX_CONSOLE_MARKETPLACE_ENVIRONMENT}`,
      '~:organization/ident',
      '~:pito',
    ]);

    return response;
  } catch (err) {
    const { response } = err as any;
    console.error('Verify email failed');
    console.error(err);

    return response;
  }
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const { userId } = req.body;

    switch (apiMethod) {
      case HttpMethod.PUT: {
        await login();
        const verifyUserResult = await verifyEmail(userId);
        const { status } = verifyUserResult;

        if (status.toString() === '204') {
          const message = `Successfully verify user ${userId}`;
          console.info(message);

          return res.status(200).end(message);
        }

        return res.status(401).end();
      }
      default:
        break;
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default composeApiCheckers(adminChecker)(handler);
