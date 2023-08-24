import { getIntegrationSdk } from '@services/sdk';
import type { TObject } from '@src/utils/types';
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

export const queryAllTransactions = async ({
  query,
  include = [],
}: any = {}) => {
  return queryAllPages({
    sdkModel: getIntegrationSdk().transactions,
    include,
    query,
  });
};

export const convertListIdToQueries = ({
  idList = [],
  query = {},
  include = [],
}: any = {}) => {
  let queries: TObject[] = [];
  const queryCount = Math.round(idList.length / 100 + 0.5);

  for (let index = 0; index < queryCount; index++) {
    const subList = idList.slice(index * 100, (index + 1) * 100);

    queries = queries.concat({
      ids: subList.join(','),
      query: {
        ...query,
      },
      include,
    });
  }

  return queries;
};

export type TCheckUnConflictedParams = {
  mealType: EMenuMealType;
  daysOfWeek: string[];
  restaurantId: string;
  id?: string;
  startDate: number;
  endDate: number;
};
