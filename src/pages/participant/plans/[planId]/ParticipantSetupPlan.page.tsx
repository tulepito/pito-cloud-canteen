import ParticipantLayout from '@components/ParticipantLayout/ParticipantLayout';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { ParticipantSetupPlanThunks } from '@redux/slices/ParticipantSetupPlanPage.slice';
import SectionCountdown from '@src/pages/participant/components/SectionCountdown/SectionCountdown';
import SectionOrderListing from '@src/pages/participant/components/SectionOrderListing/SectionOrderListing';
import SectionOrderPanel from '@src/pages/participant/components/SectionOrderPanel/SectionOrderPanel';
import SectionRestaurantHero from '@src/pages/participant/components/SectionRestaurantHero/SectionRestaurantHero';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import css from './ParticipantSetupPlan.module.scss';

const orderDeadline = 1673456400000;

const ParticipantSetupPlan = () => {
  const router = useRouter();
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);

  const dispatch = useAppDispatch();
  const { planId, orderDay } = router.query;
  const order = useAppSelector((state) => state.ParticipantSetupPlanPage.order);
  const loadDataInProgress = useAppSelector(
    (state) => state.ParticipantSetupPlanPage.loadDataInProgress,
  );
  const orderId = order?.id?.uuid;
  const plan = useAppSelector((state) => state.ParticipantSetupPlanPage.plan);
  const [orderDayState, setOrderDayState] = useState<number>();
  const currentUser = useAppSelector((state) => state.user.currentUser);

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

  useEffect(() => {
    if (router.isReady && currentUser?.id?.uuid) {
      setOrderDayState(Number(orderDay));
      dispatch(ParticipantSetupPlanThunks.loadData(`${planId}`));
    }
  }, [router.isReady, currentUser?.id?.uuid]);

  useEffect(() => {
    const restaurant = orderDayState
      ? plan?.[`${orderDayState}`]?.restaurant
      : null;
    setSelectedRestaurant(restaurant);
  }, [plan, orderDayState]);

  return (
    <ParticipantLayout>
      <div className={css.root}>
        <div className={css.leftSection}>
          <SectionRestaurantHero
            listing={selectedRestaurant}
            orderDay={Number(orderDayState)}
            inProgress={loadDataInProgress}
          />
          <SectionOrderListing
            plan={plan}
            onSelectTab={handleSelectRestaurant}
            orderDay={`${orderDayState}`}
          />
        </div>
        <div className={css.rightSection}>
          <SectionCountdown orderDeadline={orderDeadline} />
          <SectionOrderPanel planId={`${planId}`} orderId={orderId} />
        </div>
      </div>
    </ParticipantLayout>
  );
};

export default ParticipantSetupPlan;
