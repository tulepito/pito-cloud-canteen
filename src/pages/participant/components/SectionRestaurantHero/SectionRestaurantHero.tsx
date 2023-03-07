import React from 'react';
import { useIntl } from 'react-intl';
import Skeleton from 'react-loading-skeleton';
import { DateTime } from 'luxon';

import { Listing } from '@utils/data';

import css from './SectionRestaurantHero.module.scss';

type TSectionRestaurantHeroProps = {
  listing?: any;
  orderDay?: string | number;
  inProgress?: boolean;
};
const SectionRestaurantHero: React.FC<TSectionRestaurantHeroProps> = ({
  listing,
  orderDay,
  inProgress,
}) => {
  const intl = useIntl();

  const heroImage =
    listing?.images?.[0]?.attributes?.variants['landscape-crop2x']?.url;

  const { title } = Listing(listing).getAttributes();
  const parsedOrderDay = DateTime.fromMillis(Number(orderDay));
  const weekDay = parsedOrderDay.get('day');
  const fullDay = parsedOrderDay.toFormat('dd/LL/yyyy');

  const orderDayMessage = intl.formatMessage(
    {
      id: 'SectionRestaurantHero.orderDayMessage',
    },
    { weekDay, fullDay },
  );

  if (inProgress) {
    return <Skeleton className={css.skeleton} />;
  }

  return (
    <div className={css.root}>
      <div
        className={css.heroImage}
        style={{ backgroundImage: `url(${heroImage})` }}></div>
      <div className={css.heroInfo}>
        <p className={css.heroOrderDay}>{orderDayMessage}</p>
        <p className={css.heroTitle}>{title}</p>
      </div>
    </div>
  );
};

export default SectionRestaurantHero;
