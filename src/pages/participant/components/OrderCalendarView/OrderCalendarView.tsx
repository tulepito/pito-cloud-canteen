// eslint-disable-next-line import/no-named-as-default
import Avatar from '@components/Avatar/Avatar';
import CalendarDashboard from '@components/CalendarDashboard/CalendarDashboard';
import OrderEventCard from '@components/CalendarDashboard/components/OrderEventCard/OrderEventCard';
import { EVENTS_MOCKUP } from '@components/CalendarDashboard/helpers/mockupData';
import { USER } from '@utils/data';
import type { TUser } from '@utils/types';
import React from 'react';

import css from './OrderCalendarView.module.scss';

type TOrderCalendarView = { company: TUser };

const OrderCalendarView: React.FC<TOrderCalendarView> = (props) => {
  const { company } = props;

  const companyTitle = USER(company).getPublicData().displayName;
  const ensureCompanyUser = USER(company).getFullData();

  const sectionCompanyBranding = (
    <div className={css.sectionCompanyBranding}>
      <Avatar disableProfileLink user={ensureCompanyUser} />
      <span className={css.companyTitle}>{companyTitle}</span>
    </div>
  );

  return (
    <div>
      <CalendarDashboard
        events={EVENTS_MOCKUP}
        companyLogo={sectionCompanyBranding}
        renderEvent={OrderEventCard}
      />
    </div>
  );
};
export default OrderCalendarView;
