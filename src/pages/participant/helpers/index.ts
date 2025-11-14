import type { TCartFoodList } from '@src/types/cartFoodList';
import type { TPlanData } from '@src/types/order';
import { PICKING_ONLY_ONE_FOOD_NAMES } from '@src/utils/constants';

export function verifyAllFoodPickedWithParticipant(
  orderDetailIds: string[],
  cartFoodList: TCartFoodList,
  plan: TPlanData,
  isAllowAddSecondFood: boolean,
  isRequireSecondFood: boolean = false,
) {
  if (!orderDetailIds.length || !cartFoodList) {
    return false;
  }

  for (let i = 0; i < orderDetailIds.length; i += 1) {
    const dayId = orderDetailIds[i];
    const cart = cartFoodList[Number(dayId)];
    const planData = plan?.[dayId];
    const foodList = planData?.foodList ?? [];

    if (!cart || !cart.foodId) {
      return true;
    }

    if (
      isAllowAddSecondFood &&
      isRequireSecondFood &&
      !cart.secondaryFoodId &&
      cart.foodId !== 'notJoined'
    ) {
      const primaryFood = foodList.find(
        (food) => food.id?.uuid === cart.foodId,
      );

      const isSingleSelectionFood = primaryFood
        ? PICKING_ONLY_ONE_FOOD_NAMES.some((name) =>
            primaryFood.attributes?.title?.includes(name),
          )
        : false;

      if (!isSingleSelectionFood) {
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
