/* eslint-disable import/no-import-module-exports */
import type { NextApiRequest, NextApiResponse } from 'next';

import { denormalisedResponseEntities } from '@services/data';
import { getSdk } from '@services/sdk';

const getCurrentUser = async (
  req: NextApiRequest,
  res: NextApiResponse,
  params = {},
) => {
  const sdk = getSdk(req, res);
  const response = await sdk.currentUser.show(params);
  const [currentUser] = denormalisedResponseEntities(response);

  return {
    currentUser,
    response,
  };
};

module.exports = { getCurrentUser };
