import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { sleep } from '@helpers/index';
import cookies from '@services/cookie';
import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/sdk';
import type {
  OrderListing,
  RatingListing,
  UserListing,
  WithFlexSDKData,
} from '@src/types';
import { EImageVariants, EListingType } from '@src/utils/enums';

export const retrieveAll = async <T extends Array<any>>(
  queryFunction: (params: any) => Promise<WithFlexSDKData<T>>,
  params: any,
  options?: {
    denormalizeResponseEntities?: boolean;
  },
): Promise<T> => {
  const allPages: T = [] as any;
  let page = 1;
  let responses: WithFlexSDKData<T[]> = {} as any;

  do {
    // eslint-disable-next-line no-await-in-loop
    responses = await queryFunction({ ...params, page });
    if (options?.denormalizeResponseEntities) {
      allPages.push(...denormalisedResponseEntities(responses));
    } else {
      allPages.push(...responses.data.data);
    }

    page += 1;
  } while (
    responses.data.meta?.totalPages &&
    page <= responses.data.meta?.totalPages
  );

  return allPages;
};

const retrieveAllByIdChunks = async <T extends Array<any>>(
  queryFunction: (params: any) => Promise<WithFlexSDKData<T>>,
  ids: string[],
  params: any,
  options?: { chunkSize?: number; denormalizeResponseEntities?: boolean },
): Promise<T> => {
  const chunkSize = options?.chunkSize || 100;
  const denormalizeResponseEntities =
    options?.denormalizeResponseEntities || false;

  if (ids.length === 0) {
    return [] as any;
  }

  const uniqueIds = Array.from(new Set(ids));

  const allIds = uniqueIds.reduce(
    (acc: string[][], id: string, index: number) => {
      const chunkIndex = Math.floor(index / chunkSize);
      if (!acc[chunkIndex]) {
        acc[chunkIndex] = [];
      }
      acc[chunkIndex].push(id);

      return acc;
    },
    [] as string[][],
  );

  const allPages: T = [] as any;

  const chunkPromises = allIds.map((chunk) => {
    const chunkParams = {
      ...(params || {}),
      meta_id: chunk,
    };

    return queryFunction(chunkParams);
  });

  const settledResponses = await Promise.allSettled(chunkPromises);

  settledResponses.forEach((settled) => {
    if (settled.status === 'fulfilled') {
      if (denormalizeResponseEntities) {
        allPages.push(...denormalisedResponseEntities(settled.value));
      } else if (settled.value.data.data) {
        allPages.push(...settled.value.data.data);
      }
    } else {
      console.error('Error fetching chunk:', settled.reason);
    }
  });

  return allPages;
};

export interface GETCompanyRaitingsQuery {
  page?: number;
  perPage?: number;
  filterBy?: {
    orderCode?: string;
    startDate?: string;
    endDate?: string;
  };
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const integrationSdk = getIntegrationSdk();
  const { method } = req;
  const { companyId, JSONParams } = req.query as unknown as {
    companyId: string;
    JSONParams: string;
  };

  const { page, perPage, filterBy } = JSONParams
    ? (JSON.parse(JSONParams) as GETCompanyRaitingsQuery)
    : ({} as GETCompanyRaitingsQuery);

  const _orderCodeFilteredBy = filterBy?.orderCode || '';

  if (_orderCodeFilteredBy === 'MIGRATE') {
    const allRatings = await retrieveAll<RatingListing[]>(
      integrationSdk.listings.query,
      {
        meta_listingType: EListingType.rating,
      },
    );

    // eslint-disable-next-line no-restricted-syntax
    for (const rating of allRatings) {
      const metadata = rating.attributes?.metadata;
      const orderId = metadata?.orderId;

      if (
        rating.attributes?.metadata?.companyId &&
        typeof rating.attributes?.metadata?.timestamp === 'number'
      ) {
        // eslint-disable-next-line no-continue
        continue;
      }

      // eslint-disable-next-line no-await-in-loop
      await sleep(50);
      const orderListing: WithFlexSDKData<OrderListing> =
        // eslint-disable-next-line no-await-in-loop
        await integrationSdk.listings.show({
          id: orderId,
          meta_listingType: EListingType.order,
        });

      // eslint-disable-next-line no-await-in-loop
      await sleep(50);
      // eslint-disable-next-line no-await-in-loop
      await integrationSdk.listings
        .update({
          id: rating.id?.uuid,
          metadata: {
            companyId: orderListing.data.data.attributes?.metadata?.companyId,
            timestamp: rating.attributes?.metadata?.timestamp
              ? +(rating.attributes?.metadata?.timestamp || 0)
              : 0,
          },
        })
        .then(() => {
          console.log(
            'Updated rating listing:',
            rating.id,
            'with companyId',
            orderListing.data.data.attributes?.metadata?.companyId,
          );
        })
        .catch((error: any) => {
          console.error('Error updating rating listing:', String(error));
        });
    }

    return res.status(200).json([allRatings]);
  }

  const _page = Math.max(1, Number(page) || 1);
  const _perPage = Math.min(100, Number(perPage) || 10);

  if (method !== HttpMethod.GET) {
    return res.json({ message: 'Method not allowed' });
  }

  if (!companyId) {
    return res.status(400).json({ message: 'Missing companyId' });
  }

  let _orderId = '';
  if (_orderCodeFilteredBy) {
    const orderResponse: WithFlexSDKData<OrderListing[]> =
      await integrationSdk.listings.query({
        keywords: _orderCodeFilteredBy,
        meta_listingType: EListingType.order,
        page: 1,
        perPage: 1,
      });

    if (orderResponse.data.data.length > 0) {
      _orderId = orderResponse.data.data[0].id?.uuid!;
    }
  }

  try {
    const ratingListingsData: RatingListing[] = denormalisedResponseEntities(
      await integrationSdk.listings.query({
        meta_listingType: EListingType.rating,
        meta_companyId: companyId as string,
        ...(_orderId ? { meta_orderId: _orderId } : {}),
        ...(filterBy?.startDate && filterBy?.endDate
          ? {
              meta_timestamp: `${
                new Date(filterBy.startDate).valueOf() - 1
              },${new Date(filterBy.endDate).valueOf()}`,
            }
          : {}),
        page: _page,
        perPage: _perPage,
        include: ['images'],
        'fields.image': [`variants.${EImageVariants.squareSmall2x}`],
      }),
    );

    const reviewerIds = ratingListingsData.reduce((acc: string[], rating) => {
      const metadata = rating.attributes?.metadata;
      const reviewerId = metadata?.reviewerId;
      if (reviewerId) {
        acc.push(reviewerId);
      }

      return acc;
    }, []);

    const orderIds = ratingListingsData.reduce((acc: string[], rating) => {
      const metadata = rating.attributes?.metadata;
      const orderId = metadata?.orderId;
      if (orderId) {
        acc.push(orderId);
      }

      return acc;
    }, []);
    const ordersData = await retrieveAllByIdChunks<OrderListing[]>(
      integrationSdk.listings.query,
      orderIds,
      {
        meta_listingType: EListingType.order,
      },
    );

    const reviewersData = await retrieveAllByIdChunks<UserListing[]>(
      integrationSdk.users.query,
      reviewerIds,
      {
        include: ['profileImage'],
      },
      {
        denormalizeResponseEntities: true,
      },
    );

    const ratingsWithReviewersAndOrder = ratingListingsData.map((rating) => {
      const metadata = rating.attributes?.metadata;
      const reviewerId = metadata?.reviewerId;
      const reviewerData = reviewersData.find(
        (user) => user.id?.uuid === reviewerId,
      );
      const orderId = metadata?.orderId;
      const orderData = ordersData.find((order) => order.id?.uuid === orderId);

      return {
        ...rating,
        reviewer: reviewerData,
        order: orderData,
      };
    });

    res.status(200).json(ratingsWithReviewersAndOrder);
  } catch (error) {
    console.error('Error fetching rating listing:', error);
    res.status(500).json({ message: 'Error fetching rating listing' });
  }
};

export default cookies(handler);
