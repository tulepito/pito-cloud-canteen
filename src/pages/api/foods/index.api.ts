import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/sdk';

import { LISTING_TYPE } from '../helpers/constants';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const apiMethod = req.method;
  const integrationSdk = getIntegrationSdk();

  switch (apiMethod) {
    case HttpMethod.POST: {
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
        console.error(error);
        res.json(error);
      }
      break;
    }
    default:
      break;
  }
};

export default handler;
