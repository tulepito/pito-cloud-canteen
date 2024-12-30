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
  participantGroupOrderFoodChangedData?: {
    orderLink: string;
    orderCode: string;
    orderName: string;
    changes: {
      date: string;
      type: 'add' | 'remove' | 'update';
      fromFoodName?: string;
      toFoodName?: string;
      removeFoodName?: string;
      addFoodName?: string;
      participantName: string;
    }[];
  };
  participantNormalOrderFoodChangedData?: {
    orderLink: string;
    orderCode: string;
    orderName: string;
    changes: {
      date: string;
      foodName?: string;
      fromQuantity?: number;
      toQuantity?: number;
      type: 'add' | 'remove' | 'update';
    }[];
  };
  subOrderCanceledData?: {
    orderLink: string;
    orderCode: string;
    orderName: string;
    date: string;
  };
  restaurantChangedData?: {
    orderLink: string;
    orderCode: string;
    orderName: string;
    changes: {
      date: string;
      oldRestaurantName?: string;
      newRestaurantName?: string;
    }[];
  };
  partnerConfirmsSubOrderData?: {
    orderLink: string;
    orderCode: string;
    orderName: string;
    date: string;
    partnerName: string;
  };
  partnerRejectsSubOrderData?: {
    orderLink: string;
    orderCode: string;
    orderName: string;
    date: string;
    partnerName: string;
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

      case ESlackNotificationType.PARTICIPANT_GROUP_ORDER_FOOD_CHANGED: {
        const { participantGroupOrderFoodChangedData } = notificationParams;
        if (!participantGroupOrderFoodChangedData) return;
        if (!participantGroupOrderFoodChangedData.changes.length) return;

        await axios.post(
          process.env.SLACK_WEBHOOK_URL,
          {
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `:gear::gear::gear: Đơn hàng có thay đổi khi đang diễn ra:\n*<${participantGroupOrderFoodChangedData.orderLink}|#${participantGroupOrderFoodChangedData.orderCode} - ${participantGroupOrderFoodChangedData.orderName}>*`,
                },
              },
              ...participantGroupOrderFoodChangedData.changes.map((change) => {
                return {
                  type: 'section',
                  fields: [
                    {
                      type: 'mrkdwn',
                      text: `:person_in_tuxedo: Participant\n*${change.participantName}*`,
                    },
                    {
                      type: 'mrkdwn',
                      text: `:clock1: Ngày\n*${change.date}*`,
                    },
                    (change.type === 'remove' && {
                      type: 'mrkdwn',
                      text: `:x: Xóa phần ăn *${change.removeFoodName}*`,
                    }) ||
                      (change.type === 'add' && {
                        type: 'mrkdwn',
                        text: `:large_green_square: Thêm phần ăn\n*${change.addFoodName}*`,
                      }) ||
                      (change.type === 'update' && {
                        type: 'mrkdwn',
                        text: `:pencil: Thay đổi từ *${change.fromFoodName}* thành *${change.toFoodName}*`,
                      }) ||
                      {},
                  ],
                };
              }),
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

      case ESlackNotificationType.PARTICIPANT_NORMAL_ORDER_FOOD_CHANGED: {
        const { participantNormalOrderFoodChangedData } = notificationParams;
        if (!participantNormalOrderFoodChangedData) return;
        if (!participantNormalOrderFoodChangedData.changes.length) return;

        await axios.post(
          process.env.SLACK_WEBHOOK_URL,
          {
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `:gear::gear::gear: Đơn hàng có thay đổi khi đang diễn ra:\n*<${participantNormalOrderFoodChangedData.orderLink}|#${participantNormalOrderFoodChangedData.orderCode} - ${participantNormalOrderFoodChangedData.orderName}>*`,
                },
              },
              ...participantNormalOrderFoodChangedData.changes.map((change) => {
                return {
                  type: 'section',
                  fields: [
                    {
                      type: 'mrkdwn',
                      text: `:clock1: Ngày\n*${change.date}*`,
                    },
                    (change.type === 'remove' && {
                      type: 'mrkdwn',
                      text: `:x: Xóa phần ăn *${change.foodName}*`,
                    }) ||
                      (change.type === 'add' && {
                        type: 'mrkdwn',
                        text: `:large_green_square: Thêm phần ăn\n*${change.foodName}*`,
                      }) ||
                      (change.type === 'update' && {
                        type: 'mrkdwn',
                        text: `:pencil: Thay đổi số lượng\nTừ *${change.fromQuantity}* thành *${change.toQuantity}*`,
                      }) ||
                      {},
                  ],
                };
              }),
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

      case ESlackNotificationType.RESTAURANT_CHANGED: {
        const { restaurantChangedData } = notificationParams;
        if (!restaurantChangedData) return;
        if (!restaurantChangedData.changes.length) return;

        await axios.post(
          process.env.SLACK_WEBHOOK_URL,
          {
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `:truck::truck::truck: Đơn hàng đã thay đổi nhà hàng:\n*<${restaurantChangedData.orderLink}|#${restaurantChangedData.orderCode} - ${restaurantChangedData.orderName}>*`,
                },
              },
              ...restaurantChangedData.changes.map((change) => {
                return {
                  type: 'section',
                  fields: [
                    {
                      type: 'mrkdwn',
                      text: `:house: Nhà hàng cũ\n*${change.oldRestaurantName}*`,
                    },
                    {
                      type: 'mrkdwn',
                      text: `:house_with_garden: Nhà hàng mới\n*${change.newRestaurantName}*`,
                    },
                    {
                      type: 'mrkdwn',
                      text: `:clock1: Ngày\n*${change.date}*`,
                    },
                  ],
                };
              }),
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

      case ESlackNotificationType.SUB_ORDER_CANCELED: {
        const { subOrderCanceledData } = notificationParams;
        if (!subOrderCanceledData) return;

        await axios.post(
          process.env.SLACK_WEBHOOK_URL,
          {
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `:x::x::x: Sub đơn bị hủy:\n*<${subOrderCanceledData.orderLink}|#${subOrderCanceledData.orderCode} - ${subOrderCanceledData.orderName}>*`,
                },
              },
              {
                type: 'section',
                fields: [
                  {
                    type: 'mrkdwn',
                    text: `:clock1: Ngày\n*${subOrderCanceledData.date}*`,
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

      case ESlackNotificationType.PARTNER_CONFIRMS_SUB_ORDER: {
        const { partnerConfirmsSubOrderData } = notificationParams;
        if (!partnerConfirmsSubOrderData) return;

        await axios.post(
          process.env.SLACK_WEBHOOK_URL,
          {
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `:white_check_mark::white_check_mark::white_check_mark: Đối tác đã xác nhận sub đơn:\n*<${partnerConfirmsSubOrderData.orderLink}|#${partnerConfirmsSubOrderData.orderCode} - ${partnerConfirmsSubOrderData.orderName}>*`,
                },
              },
              {
                type: 'section',
                fields: [
                  {
                    type: 'mrkdwn',
                    text: `:clock1: Ngày\n*${partnerConfirmsSubOrderData.date}*`,
                  },
                  {
                    type: 'mrkdwn',
                    text: `:house: Nhà hàng\n*${partnerConfirmsSubOrderData.partnerName}*`,
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

      case ESlackNotificationType.PARTNER_REJECTS_SUB_ORDER: {
        const { partnerRejectsSubOrderData } = notificationParams;
        if (!partnerRejectsSubOrderData) return;

        await axios.post(
          process.env.SLACK_WEBHOOK_URL,
          {
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `:x::x::x: Đối tác đã từ chối sub đơn:\n*<${partnerRejectsSubOrderData.orderLink}|#${partnerRejectsSubOrderData.orderCode} - ${partnerRejectsSubOrderData.orderName}>*`,
                },
              },
              {
                type: 'section',
                fields: [
                  {
                    type: 'mrkdwn',
                    text: `:clock1: Ngày\n*${partnerRejectsSubOrderData.date}*`,
                  },
                  {
                    type: 'mrkdwn',
                    text: `:house: Nhà hàng\n*${partnerRejectsSubOrderData.partnerName}*`,
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
