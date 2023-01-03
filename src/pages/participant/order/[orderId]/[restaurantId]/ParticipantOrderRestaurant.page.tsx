import ParticipantLayout from '@components/ParticipantLayout/ParticipantLayout';
import SectionCountdown from '@src/pages/participant/components/SectionCountdown/SectionCountdown';
import SectionOrderListing from '@src/pages/participant/components/SectionOrderListing/SectionOrderListing';
import SectionOrderPanel from '@src/pages/participant/components/SectionOrderPanel/SectionOrderPanel';
import SectionRestaurantHero from '@src/pages/participant/components/SectionRestaurantHero/SectionRestaurantHero';
import { useRouter } from 'next/router';
import React from 'react';

import css from './ParticipantOrderRestaurant.module.scss';

// Mock data
const mockRestaurantListing = {
  attributes: {
    title: 'Nhà hàng vua hải sản',
  },
  images: [
    'https://res.cloudinary.com/eventors/image/upload/f_auto/v1584529827/eventors/hero-back_lbofw9.png',
  ],
};
const orderDay = 1672674762993;
const orderDeadline = 1673456400000;

const mockDishListing = [];

const ParticipantOrderRestaurant = () => {
  const router = useRouter();
  const { orderId, restaurantId } = router.query;

  return (
    <ParticipantLayout>
      <div className={css.root}>
        <div className={css.leftSection}>
          <SectionRestaurantHero
            listing={mockRestaurantListing}
            orderDay={orderDay}
          />
          <SectionOrderListing />
        </div>
        <div className={css.rightSection}>
          <SectionCountdown orderDeadline={orderDeadline} />
          <SectionOrderPanel />
        </div>
      </div>
    </ParticipantLayout>
  );
};

export default ParticipantOrderRestaurant;
