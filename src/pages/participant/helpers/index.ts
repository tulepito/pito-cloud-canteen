import { hasDishInCart } from '@hooks/useHasDishInCart';
import type { FoodListing } from '@src/types';
import type { TCartFoodList } from '@src/types/cartFoodList';
import type { TPlanData } from '@src/types/order';

/**
 * Kiểm tra món ăn có phải là single selection (numberOfMainDishes === 1)
 */
const isSingleSelectionFood = (food: FoodListing | undefined): boolean => {
  if (!food) return false;
  const numberOfMainDishes = food.attributes?.publicData?.numberOfMainDishes;
  // Mặc định cho phép chọn 2 món nếu không có numberOfMainDishes
  if (numberOfMainDishes === undefined || numberOfMainDishes === null) {
    return false;
  }

  return Number(numberOfMainDishes) === 1;
};

export function verifyAllFoodPickedWithParticipant(
  orderDetailIds: string[],
  cartFoodList: TCartFoodList,
  plan: TPlanData,
  isAllowAddSecondaryFood: boolean,
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
      isAllowAddSecondaryFood &&
      isRequireSecondFood &&
      !cart.secondaryFoodId &&
      cart.foodId !== 'notJoined'
    ) {
      const primaryFood = foodList.find(
        (food) => food.id?.uuid === cart.foodId,
      );

      if (!isSingleSelectionFood(primaryFood)) {
        return true;
      }
    }
  }

  return false;
}

export function totalFoodPickedWithParticipant(
  orderDetailIds: string[],
  cartFoodList: TCartFoodList,
  plan?: TPlanData,
  isAllowAddSecondaryFood?: boolean,
) {
  let countFoodPicked = 0;
  if (orderDetailIds.length > 0 && cartFoodList) {
    for (let i = 0; i < orderDetailIds.length; i++) {
      const dayId = orderDetailIds[i];
      const cart = cartFoodList[Number(dayId)];

      if (cart && cart.foodId) {
        if (plan && isAllowAddSecondaryFood !== undefined) {
          const foodList = plan[dayId]?.foodList ?? [];
          const hasDish = hasDishInCart(
            cart,
            foodList,
            isAllowAddSecondaryFood,
          );

          if (hasDish) {
            countFoodPicked += 1;
          }
        } else if (cart.foodId) {
          countFoodPicked += 1;
        }
      }
    }
  }

  return countFoodPicked;
}
