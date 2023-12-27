import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { orderManagementThunks } from '@redux/slices/OrderManagement.slice';

export const useAutoPickFood = (isAutoPickFood: boolean) => {
  const toggleAutoPickFoodInProgress = useAppSelector(
    (state) => state.OrderManagement.toggleAutoPickFoodInProgress,
  );

  const dispatch = useAppDispatch();
  const autoPickFoodController = useBoolean(isAutoPickFood);

  const toggleAutoPickFood = async () => {
    if (toggleAutoPickFoodInProgress) return;
    autoPickFoodController.toggle();

    await dispatch(
      orderManagementThunks.handleAutoPickFoodToggle(
        autoPickFoodController.value,
      ),
    );
  };

  useEffect(() => {
    autoPickFoodController.setValue(isAutoPickFood);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAutoPickFood]);

  return {
    isAutoPickFood: autoPickFoodController.value,
    toggleAutoPickFood,
  };
};
