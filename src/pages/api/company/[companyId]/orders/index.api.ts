/* eslint-disable no-console */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import cookies from '@services/cookie';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { denormalisedResponseEntities } from '@utils/data';
import { EOrderStates } from '@utils/enums';
import type { TPlan } from '@utils/orderTypes';
import type { TCompany, TIntegrationOrderListing, TObject } from '@utils/types';
import omit from 'lodash/omit';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const apiMethod = req.method;

  switch (apiMethod) {
    case 'GET':
      try {
        const integrationSdk = getIntegrationSdk();
        const { companyId, JSONParams } = req.query;
        const { dataParams, queryParams } = JSON.parse(JSONParams as string);

        const orderStateFromParams = dataParams?.meta_orderState;

        const response = await integrationSdk.listings.query(
          dataParams,
          queryParams,
        );

        const [company] = denormalisedResponseEntities(
          await integrationSdk.users.show({
            id: companyId,
          }),
        ) as TCompany[];
        const orders = denormalisedResponseEntities(response);

        const orderWithCompany = await Promise.all(
          orders.map(async (order: TIntegrationOrderListing) => {
            const { plans = [] } = order.attributes.metadata;

            if (plans.length > 0) {
              const [planId] = plans;
              const [plan] = denormalisedResponseEntities(
                await integrationSdk.listings.show({ id: planId }),
              ) as TPlan[];

              return {
                ...order,
                company,
                plan,
              };
            }

            return {
              ...order,
              company,
            };
          }),
        );

        const totalItemMap: TObject = {
          [orderStateFromParams || 'all']: response.data.meta.totalItems,
        };

        const queryStates = [
          EOrderStates.picking,
          EOrderStates.completed,
          EOrderStates.isNew,
          EOrderStates.canceled,
          'all',
        ];

        const paramList = queryStates.reduce<TObject[]>(
          (previousList, currentState) => {
            if (currentState !== orderStateFromParams) {
              const newItem =
                currentState !== 'all'
                  ? {
                      ...dataParams,
                      meta_orderState: currentState,
                    }
                  : omit(dataParams, 'meta_orderState');

              return previousList.concat([newItem]);
            }
            return previousList;
          },
          [],
        );

        await Promise.all(
          paramList.map(async (params) => {
            const currentState = params.meta_orderState || 'all';
            const orderResponse = await integrationSdk.listings.query(params);

            totalItemMap[currentState] = orderResponse.data.meta.totalItems;
          }),
        );

        res.json({
          orders: orderWithCompany,
          pagination: response.data.meta,
          totalItemMap,
        });
      } catch (error) {
        handleError(res, error);
      }
      break;
    case 'POST':
      break;
    default:
      break;
  }
}

export default cookies(handler);
