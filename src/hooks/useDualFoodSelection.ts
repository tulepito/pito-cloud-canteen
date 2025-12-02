import { useRef } from 'react';
import { useIntl } from 'react-intl';
import { toast } from 'react-toastify';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { shoppingCartThunks } from '@redux/slices/shoppingCart.slice';
import type { FoodListing } from '@src/types';
import type { TCartItem } from '@src/types/order';
import { SINGLE_PICK_FOOD_NAMES } from '@src/utils/constants';
import { CurrentUser } from '@utils/data';

import { useViewport } from './useViewport';

type TUseDualFoodSelectionParams = {
  mealId: string;
  mealTitle: string;
  planId: string;
  dayId: string;
  isSelected?: boolean;
  selectDisabled?: boolean;
  isOrderAlreadyStarted: boolean;
  foodList: FoodListing[];
  onAddedToCart?: ({
    foodName,
    timestamp,
  }: {
    foodName?: string;
    timestamp: string;
  }) => void;
};

type TUseDualFoodSelectionReturn = {
  requirement: string | undefined;
  storedRequirement: string;
  storedSecondRequirement: string;
  isFirstFoodSelected: boolean;
  isSecondFoodSelected: boolean;
  isFoodSelected: boolean;
  canShowAddAsSecondFood: boolean;
  canShowAddSecondOption: boolean;
  canShowPrimaryAdd: boolean;
  isPrimaryAddDisabled: boolean;
  isSecondaryAddDisabled: boolean;
  handleAddToCart: () => void;
  handleRemoveFromCart: () => void;
  handleChangeRequirement: (value: string) => void;
  getRemoveDishTooltip: () => string;
  isRestrictedForThisListing: boolean;
};

/**
 * Kiểm tra xem có chỉ được chọn 1 món không (dựa trên SINGLE_PICK_FOOD_NAMES)
 */
const isOnlyAllowPickOneFood = (
  cartItem: TCartItem | null | undefined,
  pickingFoodName: string | undefined,
  hasFirstFood: boolean,
  hasSecondFood: boolean,
  foodList: FoodListing[],
): boolean => {
  if (!cartItem || (!hasFirstFood && !hasSecondFood)) {
    return false;
  }

  const { foodId, secondaryFoodId } = cartItem;
  const food = foodList.find((f) => f.id?.uuid === foodId);
  const secondaryFood = foodList.find((f) => f.id?.uuid === secondaryFoodId);
  const hasRestrictedSelected = SINGLE_PICK_FOOD_NAMES.some((name) => {
    if (food?.attributes?.title?.includes(name)) {
      return true;
    }
    if (secondaryFood?.attributes?.title?.includes(name)) {
      return true;
    }

    return false;
  });
  const isPickingRestricted = SINGLE_PICK_FOOD_NAMES.some((name) => {
    if (pickingFoodName?.includes(name)) {
      return true;
    }

    return false;
  });

  return Boolean(
    hasRestrictedSelected ||
      (isPickingRestricted && (hasFirstFood || hasSecondFood)),
  );
};

/**
 * Hook cho logic chọn món mới - cho phép chọn món thứ 2
 * Sử dụng khi isAllowAddSecondaryFood = true
 */
export const useDualFoodSelection = ({
  mealId,
  planId,
  dayId,
  isSelected,
  selectDisabled,
  isOrderAlreadyStarted,
  foodList,
  mealTitle,
  onAddedToCart: _onAddedToCart,
}: TUseDualFoodSelectionParams): TUseDualFoodSelectionReturn => {
  const intl = useIntl();
  const { isMobileLayout } = useViewport();
  const requirementRef = useRef<string | undefined>();
  const orders = useAppSelector((state) => state.shoppingCart.orders);
  const currentUser = useAppSelector((state) => state.user.currentUser);
  const dispatch = useAppDispatch();

  const userId = CurrentUser(currentUser!).getId();
  const cartItem: TCartItem =
    orders?.[userId]?.[planId]?.[parseInt(dayId, 10)] || {};

  const storedRequirement = cartItem.requirement || '';
  const storedSecondRequirement = cartItem.secondaryRequirement || '';

  // Kiểm tra trạng thái chọn món
  const isFirstFoodSelected = cartItem.foodId === mealId;
  const isSecondFoodSelected = cartItem.secondaryFoodId === mealId;
  const hasFirstFood = !!cartItem.foodId && cartItem.foodId !== 'notJoined';
  const hasSecondFood = !!cartItem.secondaryFoodId;
  const isFoodSelected = isFirstFoodSelected || isSecondFoodSelected;

  const isRestrictedForThisListing = isOnlyAllowPickOneFood(
    cartItem,
    mealTitle,
    hasFirstFood,
    hasSecondFood,
    foodList,
  );

  const canShowAddAsSecondFood =
    hasFirstFood &&
    !hasSecondFood &&
    isFirstFoodSelected &&
    !isRestrictedForThisListing;
  const canShowAddSecondOption =
    !isFoodSelected &&
    !isSelected &&
    hasFirstFood &&
    !hasSecondFood &&
    !isRestrictedForThisListing;
  const canShowPrimaryAdd =
    !isFoodSelected && !isSelected && !canShowAddSecondOption;
  const isPrimaryAddDisabled =
    selectDisabled || hasSecondFood || isRestrictedForThisListing;
  const isSecondaryAddDisabled = selectDisabled || isRestrictedForThisListing;

  const buildNextCartState = (isAddingSecondFood: boolean) => {
    if (isAddingSecondFood) {
      return {
        cart: {
          ...cartItem,
          secondaryFoodName: mealTitle,
          secondaryFoodId: mealId,
        },
        hasFirst: hasFirstFood,
        hasSecond: true,
      };
    }

    return {
      cart: {
        ...cartItem,
        foodName: mealTitle,
        foodId: mealId,
      },
      hasFirst: true,
      hasSecond: hasSecondFood,
    };
  };

  const handleAddToCart = () => {
    if (selectDisabled || hasSecondFood) {
      return;
    }

    if (isRestrictedForThisListing) {
      return;
    }

    const isSecondFood = hasFirstFood && !hasSecondFood;
    const nextState = buildNextCartState(isSecondFood);
    const willTriggerSingleSelection = isOnlyAllowPickOneFood(
      nextState.cart,
      mealTitle,
      nextState.hasFirst,
      nextState.hasSecond,
      foodList,
    );
    dispatch(
      shoppingCartThunks.addToCart({
        planId,
        dayId,
        mealId,
        requirement: requirementRef.current,
        isSecondFood,
      }),
    );
    if (isSecondFood || willTriggerSingleSelection) {
      const firstFoodName = cartItem.foodId
        ? foodList.find((f) => f.id?.uuid === cartItem.foodId)?.attributes
            ?.title || ''
        : '';
      _onAddedToCart?.({
        foodName: `${firstFoodName} + ${mealTitle}`,
        timestamp: dayId,
      });
    } else {
      toast.success(
        intl.formatMessage({
          id: 'tiep-tuc-chon-mon-thu-hai',
        }),
        {
          position: isMobileLayout ? 'top-center' : 'bottom-center',
          toastId: 'add-to-cart',
          updateId: 'add-to-cart',
          pauseOnHover: false,
          autoClose: 3000,
        },
      );
    }
  };

  const handleRemoveFromCart = () => {
    if (isOrderAlreadyStarted) return;

    if (isSecondFoodSelected) {
      dispatch(
        shoppingCartThunks.removeFromCart({
          planId,
          dayId,
          removeSecondFood: true,
        }),
      );
    } else {
      dispatch(shoppingCartThunks.removeFromCart({ planId, dayId }));
    }
  };

  const handleChangeRequirement = (value: string) => {
    requirementRef.current = value;
  };

  const getRemoveDishTooltip = () => {
    if (isSecondFoodSelected) {
      return 'Xóa món thứ 2';
    }

    if (isFirstFoodSelected && hasSecondFood) {
      return 'Xóa món 1';
    }

    return 'Xóa món';
  };

  return {
    requirement: requirementRef.current,
    storedRequirement,
    storedSecondRequirement,
    isFirstFoodSelected,
    isSecondFoodSelected,
    isFoodSelected,
    canShowAddAsSecondFood,
    canShowAddSecondOption,
    canShowPrimaryAdd,
    isPrimaryAddDisabled,
    isSecondaryAddDisabled,
    handleAddToCart,
    handleRemoveFromCart,
    handleChangeRequirement,
    getRemoveDishTooltip,
    isRestrictedForThisListing,
  };
};
