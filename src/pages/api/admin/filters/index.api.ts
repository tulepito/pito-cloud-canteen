// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import isEmpty from 'lodash/isEmpty';
import uniqBy from 'lodash/uniqBy';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import adminChecker from '@services/permissionChecker/admin';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { denormalisedResponseEntities, User } from '@utils/data';

const ADMIN_FLEX_ID = process.env.PITO_ADMIN_ID;
async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const integrationSdk = getIntegrationSdk();
  const adminUser = denormalisedResponseEntities(
    await integrationSdk.users.show({
      id: ADMIN_FLEX_ID,
    }),
  )[0];
  const {
    categories = [],
    packaging = [],
    daySessions = [],
    nutritions = [],
  } = User(adminUser).getMetadata();

  switch (req.method) {
    case HttpMethod.POST:
      try {
        const {
          mealStyles: newMealStyles = '',
          nutritions: newNutritions = '',
          packaging: newPackaging = '',
          daySessions: newDaySessions = '',
          time,
        } = req.body;
        const updatedMetadata = {
          ...(newMealStyles && {
            categories: uniqBy(
              categories.concat({
                key: `categories-${newMealStyles}`,
                label: newMealStyles,
              }),
              'key',
            ),
          }),
          ...(newNutritions && {
            nutritions: uniqBy(
              nutritions.concat({
                key: `nutritions-${newNutritions}`,
                label: newNutritions,
              }),
              'key',
            ),
          }),
          ...(newPackaging && {
            packaging: uniqBy(
              packaging.concat({
                key: `packaging-${newPackaging}`,
                label: newPackaging,
              }),
              'key',
            ),
          }),
          ...(newDaySessions && {
            daySessions: uniqBy(
              daySessions.concat({
                key: `daySessions-${newDaySessions}`,
                label: newDaySessions,
                time,
              }),
              'key',
            ),
          }),
        };

        const updatedResponse = await integrationSdk.users.updateProfile(
          {
            id: ADMIN_FLEX_ID,
            metadata: updatedMetadata,
          },
          { expand: true },
        );
        res.json({
          ...User(
            denormalisedResponseEntities(updatedResponse)[0],
          ).getMetadata(),
        });
      } catch (error) {
        handleError(res, error);
      }
      break;

    case HttpMethod.PUT:
      try {
        const updateMetadata = (
          needUpdateAttribute: any,
          currentAttribute: any,
        ) => {
          if (isEmpty(needUpdateAttribute)) return [];
          const needUpdateItemIndex = currentAttribute.findIndex(
            (item: any) => item.key === needUpdateAttribute.key,
          );
          const updatingAttribute = [...currentAttribute];
          updatingAttribute[needUpdateItemIndex] = {
            ...updatingAttribute[needUpdateItemIndex],
            ...needUpdateAttribute,
          };

          return updatingAttribute;
        };
        const {
          mealStyles: needUpdateMealStyles = {},
          nutritions: needUpdateNutritions = {},
          packaging: needUpdatePackaging = {},
          daySessions: needUpdateDaySessions = {},
        } = req.body;
        const updateMealStylesMaybe = updateMetadata(
          needUpdateMealStyles,
          categories,
        );
        const updateNutritionsMaybe = updateMetadata(
          needUpdateNutritions,
          nutritions,
        );
        const updatePackagingMaybe = updateMetadata(
          needUpdatePackaging,
          packaging,
        );
        const updateDaySessionsMaybe = updateMetadata(
          needUpdateDaySessions,
          daySessions,
        );
        const updatedResponse = await integrationSdk.users.updateProfile(
          {
            id: ADMIN_FLEX_ID,
            metadata: {
              ...(updateMealStylesMaybe.length > 0 && {
                categories: updateMealStylesMaybe,
              }),
              ...(updateNutritionsMaybe.length > 0 && {
                nutritions: updateNutritionsMaybe,
              }),
              ...(updatePackagingMaybe.length > 0 && {
                packaging: updatePackagingMaybe,
              }),
              ...(updateDaySessionsMaybe.length > 0 && {
                daySessions: updateDaySessionsMaybe,
              }),
            },
          },
          { expand: true },
        );
        res.json({
          ...User(
            denormalisedResponseEntities(updatedResponse)[0],
          ).getMetadata(),
        });
      } catch (error) {
        handleError(res, error);
      }
      break;

    case HttpMethod.DELETE:
      try {
        const {
          mealStyles: needDeleteMealStyles = [],
          nutritions: needDeleteNutritions = [],
          packaging: needDeletePackaging = [],
          daySessions: needDeleteDaySessions = [],
        } = req.body;

        const updatedMetadata = {
          ...(needDeleteMealStyles.length > 0 && {
            categories: categories.filter(
              (item: any) => !needDeleteMealStyles.includes(item.key),
            ),
          }),
          ...(needDeleteNutritions.length > 0 && {
            nutritions: nutritions.filter(
              (item: any) => !needDeleteNutritions.includes(item.key),
            ),
          }),
          ...(needDeletePackaging.length > 0 && {
            packaging: packaging.filter(
              (item: any) => !needDeletePackaging.includes(item.key),
            ),
          }),
          ...(needDeleteDaySessions.length > 0 && {
            daySessions: daySessions.filter(
              (item: any) => !needDeleteDaySessions.includes(item.key),
            ),
          }),
        };
        const updatedResponse = await integrationSdk.users.updateProfile(
          {
            id: ADMIN_FLEX_ID,
            metadata: updatedMetadata,
          },
          { expand: true },
        );
        res.json({
          ...User(
            denormalisedResponseEntities(updatedResponse)[0],
          ).getMetadata(),
        });
      } catch (error) {
        handleError(res, error);
      }
      break;

    default:
      break;
  }
}

export default cookies(adminChecker(handler));
