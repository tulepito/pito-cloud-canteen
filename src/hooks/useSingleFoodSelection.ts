import { useRef } from 'react';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { shoppingCartThunks } from '@redux/slices/shoppingCart.slice';
import type { TCartItem } from '@src/types/order';
import { CurrentUser } from '@utils/data';

type TUseSingleFoodSelectionParams = {
  mealId: string;
  planId: string;
  dayId: string;
  isSelected?: boolean;
  selectDisabled?: boolean;
  isOrderAlreadyStarted: boolean;
  mealTitle: string;
  onAddedToCart?: ({
    foodName,
    timestamp,
  }: {
    foodName?: string;
    timestamp: string;
  }) => void;
};

type TUseSingleFoodSelectionReturn = {
  requirement: string | undefined;
  isFoodSelected: boolean;
  canShowAddButton: boolean;
  isAddDisabled: boolean;
  handleAddToCart: () => void;
  handleRemoveFromCart: () => void;
  handleChangeRequirement: (value: string) => void;
  getRemoveDishTooltip: () => string;
};

/**
 * Hook cho logic chọn món cũ - chỉ cho phép chọn 1 món duy nhất
 * Sử dụng khi isAllowAddSecondaryFood = false
 */
export const useSingleFoodSelection = ({
  mealId,
  planId,
  dayId,
  isSelected,
  selectDisabled,
  isOrderAlreadyStarted,
  mealTitle,
  onAddedToCart: _onAddedToCart,
}: TUseSingleFoodSelectionParams): TUseSingleFoodSelectionReturn => {
  const requirementRef = useRef<string | undefined>();
  const orders = useAppSelector((state) => state.shoppingCart.orders);
  const currentUser = useAppSelector((state) => state.user.currentUser);
  const dispatch = useAppDispatch();

  const userId = CurrentUser(currentUser!).getId();
  const cartItem: TCartItem =
    orders?.[userId]?.[planId]?.[parseInt(dayId, 10)] || {};

  const isFoodSelected = cartItem.foodId === mealId || Boolean(isSelected);

  const canShowAddButton = !isFoodSelected && !isSelected;
  const isAddDisabled = Boolean(selectDisabled);

  const handleAddToCart = () => {
    if (selectDisabled) {
      return;
    }

    dispatch(
      shoppingCartThunks.addToCart({
        planId,
        dayId,
        mealId,
        requirement: requirementRef.current,
        isSecondFood: false,
      }),
    );
    _onAddedToCart?.({
      foodName: mealTitle,
      timestamp: dayId,
    });
  };

  const handleRemoveFromCart = () => {
    if (isOrderAlreadyStarted) return;

    dispatch(shoppingCartThunks.removeFromCart({ planId, dayId }));
  };

  const handleChangeRequirement = (value: string) => {
    requirementRef.current = value;
  };

  const getRemoveDishTooltip = () => {
    return 'Xóa món';
  };

  return {
    requirement: requirementRef.current,
    isFoodSelected,
    canShowAddButton,
    isAddDisabled,
    handleAddToCart,
    handleRemoveFromCart,
    handleChangeRequirement,
    getRemoveDishTooltip,
  };
};
