import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { toast } from 'react-toastify';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { orderManagementThunks } from '@redux/slices/OrderManagement.slice';

export const useAutoPickFood = (value: boolean, orderId: string) => {
  const toggleAutoPickFoodInProgress = useAppSelector(
    (state) => state.OrderManagement.toggleAutoPickFoodInProgress,
  );
  const [isToggleingAutoPickFood, setIsToggleingAutoPickFood] = useState(false);

  const dispatch = useAppDispatch();
  const autoPickFoodController = useBoolean(value);

  const intl = useIntl();

  const toggleFoodAutoPicking = async () => {
    if (toggleAutoPickFoodInProgress || isToggleingAutoPickFood) {
      return;
    }

    autoPickFoodController.toggle();

    try {
      setIsToggleingAutoPickFood(true);
      await dispatch(
        orderManagementThunks.handleAutoPickFoodToggle({
          autoPickFood: autoPickFoodController.value,
          orderId,
        }),
      ).unwrap();

      if (!autoPickFoodController.value) {
        toast.success(
          intl.formatMessage({
            id: 'don-hang-nay-se-tu-dong-chon-mon-cho-nhung-thanh-vien-chua-xac-nhan-dat-don',
          }),
        );
      } else {
        toast.success(
          intl.formatMessage({
            id: 'don-hang-nay-se-khong-tu-dong-chon-mon-cho-nhung-thanh-vien-chua-xac-nhan-dat-don',
          }),
        );
      }
    } catch (error) {
      autoPickFoodController.toggle();
      toast.error(
        intl.formatMessage({ id: 'co-loi-xay-ra-vui-long-thu-lai-sau' }),
      );
    } finally {
      setIsToggleingAutoPickFood(false);
    }
  };

  useEffect(() => {
    autoPickFoodController.setValue(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return {
    autoPickingAllowed: autoPickFoodController.value,
    toggleFoodAutoPicking,
    isToggleingAutoPickFood,
  };
};
