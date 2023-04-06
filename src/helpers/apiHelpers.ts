import { getIntegrationSdk } from '@services/sdk';
import { denormalisedResponseEntities } from '@utils/data';
import type { EMenuMealType } from '@utils/enums';

// query all page
const calculateRemainPages = (meta: any) => {
  const { totalPages = 1 } = meta;
  if (totalPages <= 1) return [];

  return new Array(totalPages - 1).fill(0).map((_v, i) => i + 2);
};

export const queryAllPages = async ({
  sdkModel,
  query,
  include,
  pagesPerRequest = 100,
  fields = {},
}: any) => {
  let result: any = [];
  const queryPage = async ({ page }: any) => {
    const response = await sdkModel.query({
      include,
      page,
      pagesPerRequest,
      ...fields,
      ...query,
    });
    result = [...result, ...denormalisedResponseEntities(response)];

    return response;
  };
  // query first page to get meta
  const firstResponse = await queryPage({ page: 1 });
  const { meta } = firstResponse.data;
  const remainPages = calculateRemainPages(meta);
  if (remainPages.length) {
    await Promise.all(remainPages.map((page) => queryPage({ page })));

    return result;
  }

  return result;
};

export const queryAllUsers = async ({ query, include = [] }: any = {}) => {
  return queryAllPages({
    sdkModel: getIntegrationSdk().users,
    include,
    query,
  });
};

export const queryAllListings = async ({ query, include = [] }: any = {}) => {
  return queryAllPages({
    sdkModel: getIntegrationSdk().listings,
    include,
    query,
  });
};

export type TCheckUnConflictedParams = {
  mealType: EMenuMealType;
  daysOfWeek: string[];
  restaurantId: string;
  id?: string;
  startDate: number;
  endDate: number;
};
