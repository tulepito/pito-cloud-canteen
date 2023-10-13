import { DateTime } from 'luxon';

import { parseThousandNumber } from '@helpers/format';

import { formatTimestamp, VNTimezone } from '../dates';
import { getLabelByKey, SIDE_DISH_OPTIONS } from '../enums';

const { NEXT_PUBLIC_CANONICAL_URL } = process.env;

type TEditFoodTemplate = {
  restaurantId: string;
  foodId: string;
  partnerName: string;
  foodName: string;
  title?: {
    oldValue: string;
    newValue: string;
  };
  foodType?: {
    oldValue: string;
    newValue: string;
  };
  images?: {
    oldValue: string[];
    newValue: string[];
  };
  description?: {
    oldValue: string;
    newValue: string;
  };
  price?: {
    oldValue: number;
    newValue: number;
  };
  sideDishes?: {
    oldValue: string[];
    newValue: string[];
  };
};
export const editFoodTemplate = (params: TEditFoodTemplate) => {
  const {
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
  } = params;

  const content = `Đối tác vừa chỉnh sửa một món ăn mới 😍\n
${NEXT_PUBLIC_CANONICAL_URL}/admin/partner/${restaurantId}/settings/food/${foodId}/?mode=viewOnly\n
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
Nội dung cũ:\n${title ? `Tên món ăn: ${title.oldValue}\n` : ''}${
    foodType ? `Loại món ăn: ${foodType.oldValue}\n` : ''
  }${images ? `Hình ảnh: -\n` : ''}${
    description ? `Mô tả chi tiết: ${description.oldValue}\n` : ''
  }${price ? `Đơn giá: ${parseThousandNumber(price.oldValue)}đ\n` : ''}${
    sideDishes
      ? `Món ăn kèm: ${sideDishes.oldValue
          .map((item: string) => getLabelByKey(SIDE_DISH_OPTIONS, item))
          .join(', ')}\n`
      : ''
  }
--------\n
Nội dung mới:\n
${title ? `Tên món ăn: ${title.newValue}\n` : ''}${
    foodType ? `Loại món ăn: ${foodType.newValue}\n` : ''
  }${images ? `Hình ảnh: -\n` : ''}${
    description ? `Mô tả chi tiết: ${description.newValue}\n` : ''
  }${price ? `Đơn giá: ${parseThousandNumber(price.newValue)}đ\n` : ''}${
    sideDishes
      ? `Món ăn kèm: ${sideDishes.newValue
          .map((item: string) => getLabelByKey(SIDE_DISH_OPTIONS, item))
          .join(', ')}\n`
      : ''
  }`;

  return content;
};
