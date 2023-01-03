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

// Mock data
const mockRestaurantListing = {
  attributes: {
    title: 'Nhà hàng vua hải sản',
  },
  images: [
    'https://res.cloudinary.com/eventors/image/upload/f_auto/v1584529827/eventors/hero-back_lbofw9.png',
  ],
};

const orderDeadline = 1673456400000;

const ParticipantSetupPlan = () => {
  const router = useRouter();
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);

  const dispatch = useAppDispatch();
  const { planId, orderDay } = router.query;
  const order = useAppSelector((state) => state.ParticipantSetupPlanPage.order);
  const plan = useAppSelector((state) => state.ParticipantSetupPlanPage.plan);

  const handleSelectRestaurant = (selectedItem: any) => {
    const dayId = selectedItem?.id;
    if (dayId && dayId !== 'Loading...' && dayId !== orderDay) {
      const restaurant = dayId ? plan?.[dayId]?.restaurant : null;
      setSelectedRestaurant(restaurant);
      window.history.pushState(
        { urlPath: `/participant/plans/${planId}?orderDay=${dayId}` },
        '',
        `/participant/plans/${planId}?orderDay=${dayId}`,
      );
    }
  };

  useEffect(() => {
    if (router.isReady) {
      dispatch(ParticipantSetupPlanThunks.loadData(`${planId}`));
    }
  }, [router.isReady]);

  return (
    <ParticipantLayout>
      <div className={css.root}>
        <div className={css.leftSection}>
          <SectionRestaurantHero
            listing={selectedRestaurant}
            orderDay={Number(orderDay)}
          />
          <SectionOrderListing
            plan={plan}
            onSelectTab={handleSelectRestaurant}
          />
        </div>
        <div className={css.rightSection}>
          <SectionCountdown orderDeadline={orderDeadline} />
          <SectionOrderPanel planId={`${planId}`} />
        </div>
      </div>
    </ParticipantLayout>
  );
};

export default ParticipantSetupPlan;
