import { getIntegrationSdk } from '@services/sdk';
import type { NextApiRequest, NextApiResponse } from 'next';

import { denormalisedResponseEntities } from '../../../utils/data';
import { HTTP_METHODS, LISTING_TYPE } from '../helpers/constants';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const apiMethod = req.method;
  const integrationSdk = getIntegrationSdk();

  switch (apiMethod) {
    case HTTP_METHODS.GET: {
      return res.json({
        msg: 'Hello babe',
      });
      break;
    }
    case HTTP_METHODS.POST: {
      try {
        const { restaurantId, title, description } = req.body;

        const restaurantResponse = await integrationSdk.listings.show(
          {
            id: restaurantId,
            include: 'author',
          },
          { extend: 'true' },
        );

        const restaurantData =
          denormalisedResponseEntities(restaurantResponse)[0];
        const foodIds = restaurantData?.attributes.metadata?.foods || [];
        const authorId = restaurantData?.author.id.uuid;

        const foodListingData = {
          title,
          state: 'published',
          description,
          authorId,
          metadata: {
            restaurantId,
            listingType: LISTING_TYPE.FOOD,
          },
        };

        const foodListingResponse = await integrationSdk.listings.create(
          foodListingData,
        );

        const foodListingId =
          denormalisedResponseEntities(foodListingResponse)[0].id.uuid;

        await integrationSdk.listings.update({
          id: restaurantId,
          metadata: {
            foods: [...foodIds, foodListingId],
          },
        });

        res.status(201).json({
          data: [],
          statusCode: 201,
          message: 'Create food listing successfully',
        });
      } catch (error) {
        console.log(error);
        res.json(error);
      }
      break;
    }
    default:
      break;
  }
};

export default handler;
