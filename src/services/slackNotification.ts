import axios from 'axios';

import { Listing, User } from '@src/utils/data';
import { ESlackNotificationType } from '@src/utils/enums';
import { editFoodTemplate } from '@src/utils/slackTemplates/editFood';
import { newFoodTemplate } from '@src/utils/slackTemplates/newFood';

import { fetchListing } from './integrationHelper';

type SlackNotificationParams = {
  foodId: string;
  restaurantId: string;
  changeContent?: {
    [key: string]: {
      oldValue: any;
      newValue: any;
    };
  };
};

export const createSlackNotification = async (
  notificationType: ESlackNotificationType,
  notificationParams: SlackNotificationParams,
) => {
  try {
    switch (notificationType) {
      case ESlackNotificationType.CREATE_NEW_FOOD:
        {
          const { restaurantId, foodId } = notificationParams;
          const restaurant = await fetchListing(restaurantId);
          const food = await fetchListing(foodId);
          const restaurantListing = Listing(restaurant);
          const foodListing = User(food);
          const { title: foodName, createdAt } = foodListing.getAttributes();
          const { title: partnerName } = restaurantListing.getAttributes();
          const content = newFoodTemplate({
            restaurantId,
            foodId,
            partnerName,
            foodName,
            createdAt,
          });
          await axios.post(process.env.SLACK_WEBHOOK_URL!, {
            text: content,
          });
        }
        break;

      case ESlackNotificationType.UPDATE_FOOD:
        {
          const {
            restaurantId,
            foodId,
            changeContent = {},
          } = notificationParams;
          const restaurant = await fetchListing(restaurantId);
          const food = await fetchListing(foodId);
          const restaurantListing = Listing(restaurant);
          const foodListing = User(food);
          const { title: foodName } = foodListing.getAttributes();
          const { title: partnerName } = restaurantListing.getAttributes();

          const { title, foodType, images, description, price, sideDishes } =
            changeContent;
          const content = editFoodTemplate({
            restaurantId,
            foodId,
            partnerName,
            foodName,
            title,
            foodType,
            images,
            description,
            price,
            sideDishes,
          });
          await axios.post(process.env.SLACK_WEBHOOK_URL!, {
            text: content,
          });
        }
        break;
      default:
        break;
    }
  } catch (error) {
    console.log('error', error);
  }
};
