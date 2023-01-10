import ParticipantLayout from '@components/ParticipantLayout/ParticipantLayout';
import { LISTING } from '@utils/data';
import { useRouter } from 'next/router';
import React from 'react';

import SectionCountdown from '../../components/SectionCountdown/SectionCountdown';
import SectionOrderListing from '../../components/SectionOrderListing/SectionOrderListing';
import SectionOrderPanel from '../../components/SectionOrderPanel/SectionOrderPanel';
import SectionRestaurantHero from '../../components/SectionRestaurantHero/SectionRestaurantHero';
import { useLoadData } from './hooks/loadData';
import { useSelectRestaurant } from './hooks/restaurant';
import css from './ParticipantPlan.module.scss';

const ParticipantPlan = () => {
  // Router
  const router = useRouter();
  const { planId } = router.query;

  // Load data
  const { loadDataInProgress, order, plan } = useLoadData();
  const { orderDayState, selectedRestaurant, handleSelectRestaurant } =
    useSelectRestaurant();

  const orderId = order?.id?.uuid;
  const { generalInfo } = LISTING(order).getMetadata();
  const { orderDeadline } = generalInfo || {};

  // Render
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
          <SectionCountdown orderDeadline={orderDeadline || Date.now()} />
          <SectionOrderPanel planId={`${planId}`} orderId={orderId} />
        </div>
      </div>
    </ParticipantLayout>
  );
};

export default ParticipantPlan;
