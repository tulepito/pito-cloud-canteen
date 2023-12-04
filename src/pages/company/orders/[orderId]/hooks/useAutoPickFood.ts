import { useState } from 'react';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { orderManagementThunks } from '@redux/slices/OrderManagement.slice';
import { CurrentUser } from '@src/utils/data';

export const useAutoPickFood = () => {
  const currentUser = useAppSelector((state) => state.user.currentUser);
  const toggleAutoPickFoodInProgress = useAppSelector(
    (state) => state.OrderManagement.toggleAutoPickFoodInProgress,
  );
  const currentUserGetter = CurrentUser(currentUser!);

  const dispatch = useAppDispatch();

  const { isAutoPickFood = false } = currentUserGetter.getPublicData();
  const [autoPickFood, setAutoPickFood] = useState<boolean>(isAutoPickFood);

  const toggleAutoPickFood = async () => {
    if (toggleAutoPickFoodInProgress) return;
    setAutoPickFood((prevValue) => !prevValue);

    await dispatch(
      orderManagementThunks.handleAutoPickFoodToggle(autoPickFood),
    );
  };

  return {
    isAutoPickFood: autoPickFood,
    toggleAutoPickFood,
  };
};
