import axios from 'axios';
import { DateTime } from 'luxon';

import { parseThousandNumber } from '@helpers/format';
import { Listing, User } from '@src/utils/data';
import { formatTimestamp, VNTimezone } from '@src/utils/dates';
import {
  ESlackNotificationType,
  getLabelByKey,
  SIDE_DISH_OPTIONS,
} from '@src/utils/enums';

import { fetchListing } from './integrationHelper';

const { NEXT_PUBLIC_CANONICAL_URL } = process.env;

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
          const content = `Đối tác vừa đăng tải một món ăn mới 😍\n
${NEXT_PUBLIC_CANONICAL_URL}/admin/partner/${restaurantId}/settings/food/${foodId}/\n
*Tên đối tác*\n
${partnerName}\n
*Món ăn*\n
${foodName}\n
*Thời gian tạo*\n
${formatTimestamp(createdAt.getTime(), 'HH:mm, dd/MM/yyyy')}\n`;
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
          const content = `Đối tác vừa chỉnh sửa một món ăn mới 😍\n
${NEXT_PUBLIC_CANONICAL_URL}/admin/partner/${restaurantId}/settings/food/${foodId}/\n
*Tên đối tác*\n
${partnerName}\n
*Món ăn*\n
${foodName}\n
*Thời gian chỉnh sửa*\n
${formatTimestamp(
  DateTime.now().setZone(VNTimezone).toMillis(),
  'HH:mm, dd/MM/yyyy',
)}\n
*Nội dung chỉnh sửa*\n
Nội dung cũ:\n
${title ? `Tên món ăn: ${title.oldValue}\n` : ''}
${foodType ? `Loại món ăn: ${foodType.oldValue}\n` : ''}
${images ? `Hình ảnh: -\n` : ''}
${description ? `Mô tả chi tiết: ${description.oldValue}\n` : ''}
${price ? `Đơn giá: ${parseThousandNumber(price.oldValue)}đ\n` : ''}
${
  sideDishes
    ? `Món ăn kèm: ${sideDishes.oldValue
        .map((item: string) => getLabelByKey(SIDE_DISH_OPTIONS, item))
        .join(', ')}\n`
    : ''
}
--------\n
Nội dung mới:\n
${title ? `Tên món ăn: ${title.newValue}\n` : ''}
${foodType ? `Loại món ăn: ${foodType.newValue}\n` : ''}
${images ? `Hình ảnh: -\n` : ''}
${description ? `Mô tả chi tiết: ${description.newValue}\n` : ''}
${price ? `Đơn giá: ${parseThousandNumber(price.newValue)}đ\n` : ''}
${
  sideDishes
    ? `Món ăn kèm: ${sideDishes.newValue
        .map((item: string) => getLabelByKey(SIDE_DISH_OPTIONS, item))
        .join(', ')}\n`
    : ''
}`;
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
