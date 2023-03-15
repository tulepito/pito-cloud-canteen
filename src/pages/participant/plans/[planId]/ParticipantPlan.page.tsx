import React from 'react';
import { useRouter } from 'next/router';

import IconArrow from '@components/Icons/IconArrow/IconArrow';
import NamedLink from '@components/NamedLink/NamedLink';
import ParticipantLayout from '@components/ParticipantLayout/ParticipantLayout';
import { participantPaths } from '@src/paths';
import { Listing } from '@utils/data';

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
  const { deadlineDate = Date.now() } = Listing(order).getMetadata();

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
          <div>
            <NamedLink
              path={participantPaths.Order}
              params={{ orderId }}
              className={css.goBackBtn}>
              <IconArrow direction="left" />
              Quay lại
            </NamedLink>
          </div>
          <SectionOrderListing
            plan={plan}
            onSelectTab={handleSelectRestaurant}
            orderDay={`${orderDayState}`}
          />
        </div>
        <div className={css.rightSection}>
          <SectionCountdown orderDeadline={deadlineDate} />
          <SectionOrderPanel planId={`${planId}`} orderId={orderId} />
        </div>
      </div>
    </ParticipantLayout>
  );
};

export default ParticipantPlan;
