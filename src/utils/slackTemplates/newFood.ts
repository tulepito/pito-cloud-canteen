import { formatTimestamp } from '../dates';

const { NEXT_PUBLIC_CANONICAL_URL } = process.env;

type TNewFoodTemplate = {
  restaurantId: string;
  foodId: string;
  partnerName: string;
  foodName: string;
  createdAt: Date;
};
export const newFoodTemplate = (params: TNewFoodTemplate) => {
  const { restaurantId, foodId, partnerName, foodName, createdAt } = params;
  const content = `Đối tác vừa đăng tải một món ăn mới 😍\n
${NEXT_PUBLIC_CANONICAL_URL}/admin/partner/${restaurantId}/settings/food/${foodId}/\n
*Tên đối tác*\n
${partnerName}\n
*Món ăn*\n
${foodName}\n
*Thời gian tạo*\n
${formatTimestamp(createdAt.getTime(), 'HH:mm, dd/MM/yyyy')}\n`;

  return content;
};
