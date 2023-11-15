import { useMemo } from 'react';
import type { Event } from 'react-big-calendar';
import { Views } from 'react-big-calendar';
import { DateTime } from 'luxon';

import CalendarDashboard from '@components/CalendarDashboard/CalendarDashboard';
import useSelectDay from '@components/CalendarDashboard/hooks/useSelectDay';
import NamedLink from '@components/NamedLink/NamedLink';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useViewport } from '@hooks/useViewport';
import EmptySubOrder from '@pages/participant/orders/components/EmptySubOrder/EmptySubOrder';
import { partnerPaths } from '@src/paths';
import { isSameDate } from '@src/utils/dates';

import PartnerDashboardToolbar from './PartnerDashboardToolbar/PartnerDashboardToolbar';
import SubOrderEventCard from './SubOrderEventCard/SubOrderEventCard';

import css from './OrderCalendar.module.scss';

type TOrderCalendarProps = {
  data: any[];
  inProgress?: boolean;
  startDate: number;
  endDate: number;
};

const OrderCalendar: React.FC<TOrderCalendarProps> = (props) => {
  const { data = [], inProgress, startDate, endDate } = props;
  const { selectedDay } = useSelectDay();
  const { isMobileLayout } = useViewport();

  const events: Event[] = useMemo(() => {
    return data.map((item) => ({
      resource: {
        subOrderTitle: item.subOrderTitle,
        deliveryHour: item.deliveryHour,
        lastTransition: item.lastTransition,
      },
      title: item.subOrderTitle,
      start: DateTime.fromMillis(+item.subOrderDate).toJSDate(),
      end: DateTime.fromMillis(+item.subOrderDate).plus({ hour: 1 }).toJSDate(),
    }));
  }, [data]);

  const subOrdersFromSelectedDay = useMemo(
    () =>
      events.filter((_event: Event) => isSameDate(_event.start!, selectedDay)),
    [events, selectedDay],
  );

  const toolbarComponent = isMobileLayout
    ? () => <></>
    : (toolbarProps: any) => (
        <PartnerDashboardToolbar
          {...toolbarProps}
          startDate={new Date(startDate)}
          endDate={new Date(endDate)}
        />
      );

  return (
    <div className={css.root}>
      <div className={css.titleHeader}>
        <div>Lịch đơn hàng</div>
        <NamedLink path={partnerPaths.ManageOrders} className={css.link}>
          Xem tất cả đơn hàng
        </NamedLink>
      </div>
      <div className={css.dataWrapper}>
        <CalendarDashboard
          anchorDate={selectedDay}
          events={events}
          renderEvent={SubOrderEventCard}
          inProgress={inProgress}
          defaultView={Views.WEEK}
          components={{ toolbar: toolbarComponent }}
          resources={{ hideEmptySubOrderSection: true }}
        />
        <div className={css.subOrderList}>
          {subOrdersFromSelectedDay.map((item, index) => (
            <SubOrderEventCard key={index} event={item} />
          ))}
        </div>
        <RenderWhen condition={!inProgress}>
          <RenderWhen condition={data.length === 0}>
            <div className={css.empty}>
              <EmptySubOrder title="Bạn chưa có đơn hàng nào" />
            </div>
          </RenderWhen>
        </RenderWhen>
      </div>
    </div>
  );
};

export default OrderCalendar;
