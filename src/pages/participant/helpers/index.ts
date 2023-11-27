import type { TCartFoodList } from '@src/types/cartFoodList';

export function verifyAllFoodPickedWithParticipant(
  orderDetailIds: string[],
  cartFoodList: TCartFoodList,
) {
  if (orderDetailIds.length > 0 && cartFoodList) {
    for (let i = 0; i < orderDetailIds.length; i++) {
      const cart = cartFoodList[Number(orderDetailIds[i])];
      if (!cart || !cart.foodId) {
        return true;
      }
    }
  }

  return false;
}

export function totalFoodPickedWithParticipant(
  orderDetailIds: string[],
  cartFoodList: TCartFoodList,
) {
  let countFoodPicked = 0;
  if (orderDetailIds.length > 0 && cartFoodList) {
    for (let i = 0; i < orderDetailIds.length; i++) {
      const cart = cartFoodList[Number(orderDetailIds[i])];
      if (cart && cart.foodId) {
        countFoodPicked += 1;
      }
    }
  }

  return countFoodPicked;
}
