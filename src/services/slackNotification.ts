import axios from 'axios';

import logger from '@helpers/logger';
import { Listing, User } from '@src/utils/data';
import { ESlackNotificationType } from '@src/utils/enums';
import { editFoodTemplate } from '@src/utils/slackTemplates/editFood';
import { newFoodTemplate } from '@src/utils/slackTemplates/newFood';

import { fetchListing } from './integrationHelper';

type SlackNotificationParams = {
  foodId?: string;
  restaurantId?: string;
  changeContent?: {
    [key: string]: {
      oldValue: any;
      newValue: any;
    };
  };
  orderStatusChangesToInProgressData?: {
    orderLink: string;
    orderName: string;
    companyName: string;
    startDate: string;
    deliveryHour: string;
    deliveryAddress: string;
    orderCode: string;
  };
};

export const createSlackNotification = async (
  notificationType: ESlackNotificationType,
  notificationParams: SlackNotificationParams,
) => {
  if (process.env.SLACK_WEBHOOK_ENABLED !== 'true') return;

  try {
    logger.info(
      'createSlackNotification',
      `notificationType: ${notificationType}`,
    );
    switch (notificationType) {
      case ESlackNotificationType.CREATE_NEW_FOOD:
        {
          const { restaurantId, foodId } = notificationParams;

          if (!restaurantId || !foodId) return;

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
          await axios.post(process.env.SLACK_WEBHOOK_URL, {
            text: content,
          });
        }
        break;
      case ESlackNotificationType.ORDER_STATUS_CHANGES_TO_IN_PROGRESS: {
        if (!notificationParams.orderStatusChangesToInProgressData) return;

        await axios.post(
          process.env.SLACK_WEBHOOK_URL,
          {
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `:firecracker::firecracker::firecracker: Bạn có đơn hàng đang triển khai:\n*<${notificationParams.orderStatusChangesToInProgressData.orderLink}|#${notificationParams.orderStatusChangesToInProgressData.orderCode} - ${notificationParams.orderStatusChangesToInProgressData.orderName}>*`,
                },
              },
              {
                type: 'section',
                fields: [
                  {
                    type: 'mrkdwn',
                    text: `*Khách hàng:*\n${notificationParams.orderStatusChangesToInProgressData.companyName}`,
                  },
                  {
                    type: 'mrkdwn',
                    text: `*Giao đến:*\n${notificationParams.orderStatusChangesToInProgressData.deliveryAddress}`,
                  },
                  {
                    type: 'mrkdwn',
                    text: `*Ngày bắt đầu:*\n${notificationParams.orderStatusChangesToInProgressData.startDate}`,
                  },

                  {
                    type: 'mrkdwn',
                    text: `*Giờ giao hàng:*\n${notificationParams.orderStatusChangesToInProgressData.deliveryHour}`,
                  },
                ],
              },
            ],
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
        break;
      }
      case ESlackNotificationType.UPDATE_FOOD:
        {
          const {
            restaurantId,
            foodId,
            changeContent = {},
          } = notificationParams;

          if (!restaurantId || !foodId) return;

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
          await axios.post(process.env.SLACK_WEBHOOK_URL, {
            text: content,
          });
        }
        break;
      default:
        break;
    }
  } catch (error) {
    logger.error('createSlackNotification', String(error));
  }
};
