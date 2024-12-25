import { FormattedMessage } from 'react-intl';

import {
  AFTERNOON_SESSION,
  EVENING_SESSION,
  MORNING_SESSION,
} from '@components/CalendarDashboard/helpers/constant';
import { getDeliveryTimeFromMealType } from '@src/utils/dates';
import { EMenuMealType } from '@src/utils/enums';

export const HOMEPAGE_MEAL_LINKS = [
  {
    key: EMenuMealType.breakfast,
    label: <FormattedMessage id="MenuMealType.label.breakfast" />,
    path: `/company/booker/orders/new/?deliveryHour=${getDeliveryTimeFromMealType(
      EMenuMealType.breakfast,
    )}`,
    imageSrc: '/images/meal-breakfast.png',
    daySession: MORNING_SESSION,
    subLabel: <FormattedMessage id="MenuMealType.subLabel.breakfast" />,
  },
  {
    key: EMenuMealType.lunch,
    label: <FormattedMessage id="MenuMealType.label.lunch" />,
    path: `/company/booker/orders/new/?deliveryHour=${getDeliveryTimeFromMealType(
      EMenuMealType.lunch,
    )}`,
    imageSrc: '/images/meal-lunch.png',
    daySession: AFTERNOON_SESSION,
    subLabel: <FormattedMessage id="MenuMealType.subLabel.lunch" />,
  },
  {
    key: EMenuMealType.dinner,
    label: <FormattedMessage id="MenuMealType.label.dinner" />,
    path: `/company/booker/orders/new/?deliveryHour=${getDeliveryTimeFromMealType(
      EMenuMealType.dinner,
    )}`,
    imageSrc: '/images/meal-dinner.png',
    daySession: EVENING_SESSION,
    subLabel: <FormattedMessage id="MenuMealType.subLabel.dinner" />,
  },
];
