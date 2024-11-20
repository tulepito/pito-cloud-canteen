import { useEffect, useState } from 'react';
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
          'Đơn hàng này sẽ tự động chọn món cho những thành viên chưa xác nhận đặt đơn',
        );
      } else {
        toast.success(
          'Đơn hàng này sẽ không tự động chọn món cho những thành viên chưa xác nhận đặt đơn',
        );
      }
    } catch (error) {
      autoPickFoodController.toggle();
      toast.error('Có lỗi xảy ra, vui lòng thử lại sau');
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
