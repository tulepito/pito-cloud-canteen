import { LISTING } from '@utils/data';
import { DateTime } from 'luxon';
import React from 'react';
import { useIntl } from 'react-intl';

import css from './SectionRestaurantHero.module.scss';

type TSectionRestaurantHeroProps = {
  listing?: any;
  orderDay?: number;
};
const SectionRestaurantHero: React.FC<TSectionRestaurantHeroProps> = ({
  listing,
  orderDay,
}) => {
  const intl = useIntl();

  const heroImage = listing?.images[0];
  const { title } = LISTING(listing).getAttributes();
  const parsedOrderDay = DateTime.fromMillis(orderDay as number);
  const weekDay = parsedOrderDay.get('day');
  const fullDay = parsedOrderDay.toFormat('dd/LL/yyyy');

  const orderDayMessage = intl.formatMessage(
    {
      id: 'SectionRestaurantHero.orderDayMessage',
    },
    { weekDay, fullDay },
  );

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
