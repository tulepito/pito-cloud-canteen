import type { FoodListing } from '@src/types';
import type { TCartItem } from '@src/types/order';

/**
 * Kiểm tra xem cart item đã chọn đủ món chưa
 * @param cartItem - Cart item cần kiểm tra
 * @param foodList - Danh sách món ăn
 * @param isAllowAddSecondaryFood - Có cho phép chọn món thứ 2 không
 * @returns false nếu chưa chọn, 'notJoined' nếu notJoined, true nếu đã chọn đủ
 */
export const hasDishInCart = (
  cartItem: TCartItem | undefined,
  foodList: FoodListing[],
  isAllowAddSecondaryFood: boolean,
): string | boolean => {
  if (!cartItem?.foodId) {
    return false;
  }

  if (cartItem.foodId === 'notJoined') {
    return 'notJoined';
  }

  if (isAllowAddSecondaryFood) {
    // Kiểm tra xem món đầu có phải là single selection không
    const primaryFood = foodList.find(
      (food) => food?.id?.uuid === cartItem.foodId,
    );
    let isPrimarySingleSelection = false;
    if (primaryFood) {
      const numberOfMainDishes =
        primaryFood.attributes?.publicData?.numberOfMainDishes;
      isPrimarySingleSelection =
        numberOfMainDishes !== undefined &&
        numberOfMainDishes !== null &&
        Number(numberOfMainDishes) === 1;
    }

    // Nếu món đầu là single selection, chỉ cần foodId
    // Nếu không, cần cả foodId và secondaryFoodId
    return Boolean(
      cartItem.foodId &&
        (isPrimarySingleSelection || cartItem.secondaryFoodId),
    );
  }

  // Không cho phép chọn món thứ 2, chỉ cần foodId
  return Boolean(cartItem.foodId);
};

