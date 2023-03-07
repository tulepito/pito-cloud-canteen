import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { useAppSelector } from '@hooks/reduxHooks';

export const useSelectRestaurant = () => {
  // Router
  const router = useRouter();
  const { planId, orderDay } = router.query;

  // Redux selector
  const currentUser = useAppSelector((state) => state.user.currentUser);
  const plan = useAppSelector((state) => state.ParticipantPlanPage.plan);

  // Local state
  const [orderDayState, setOrderDayState] = useState<number>();
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);

  // Effect
  useEffect(() => {
    const restaurant = orderDayState
      ? plan?.[`${orderDayState}`]?.restaurant
      : null;
    setSelectedRestaurant(restaurant);
  }, [plan, orderDayState]);

  useEffect(() => {
    if (router.isReady && currentUser?.id?.uuid) {
      setOrderDayState(Number(orderDay));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, currentUser?.id?.uuid]);

  // Methods
  const handleSelectRestaurant = (selectedItem: any) => {
    const dayId = selectedItem?.id;

    if (dayId && dayId !== 'Loading...') {
      setOrderDayState(Number(dayId));

      window.history.pushState(
        { urlPath: `/participant/plans/${planId}?orderDay=${dayId}` },
        '',
        `/participant/plans/${planId}?orderDay=${dayId}`,
      );
    }
  };

  return {
    orderDayState,
    selectedRestaurant,
    handleSelectRestaurant,
  };
};
