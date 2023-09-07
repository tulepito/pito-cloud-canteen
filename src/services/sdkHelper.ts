import type { NextApiRequest, NextApiResponse } from 'next';

import type { TObject } from '@src/utils/types';

import { denormalisedResponseEntities } from './data';
import { getSdk } from './sdk';

export const queryListings = async (
  req: NextApiRequest,
  res: NextApiResponse,
  dataParams: TObject = {},
  queryParams: TObject = {},
) => {
  const sdk = getSdk(req, res);

  const response = await sdk.listings.query(dataParams, queryParams);

  const listings = denormalisedResponseEntities(response);

  return {
    listings,
    response,
  };
};

export const showCurrentUser = async (
  req: NextApiRequest,
  res: NextApiResponse,
  queryParams: TObject = {},
) => {
  const sdk = getSdk(req, res);

  const response = await sdk.currentUser.show(queryParams);

  const [currentUser] = denormalisedResponseEntities(response);

  return {
    currentUser,
    response,
  };
};

export const showUserById = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
  dataParams: TObject = {},
  queryParams: TObject = {},
) => {
  const sdk = getSdk(req, res);

  const response = await sdk.users.show(
    {
      id: userId,
      ...dataParams,
    },
    queryParams,
  );

  const [user] = denormalisedResponseEntities(response);

  return {
    user,
    response,
  };
};
