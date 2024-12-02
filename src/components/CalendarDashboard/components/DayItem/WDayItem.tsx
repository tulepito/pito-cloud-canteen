import type { ReactNode } from 'react';
import { useCallback } from 'react';
import type { Event } from 'react-big-calendar';

import useSelectDay from '@components/CalendarDashboard/hooks/useSelectDay';
import { useViewport } from '@hooks/useViewport';
import { EInvalidRestaurantCase } from '@src/utils/enums';
import type { TObject } from '@utils/types';

import type {
  TCalendarItemCardComponents,
  TDayColumnHeaderProps,
} from '../../helpers/types';

import DayItemContent from './DayItemContent';
import DayItemHeader from './DayItemHeader';

import css from './DayItem.module.scss';

type TWDayItemProps = {
  date: Date;
  events?: Event[];
  resources?: any;
  renderEvent?: React.FC<any>;
  components?: TCalendarItemCardComponents;
  customHeader?: (params: TDayColumnHeaderProps) => ReactNode;
  eventExtraProps?: TObject;
};

const WDayItem: React.FC<TWDayItemProps> = ({
  date,
  events = [],
  resources,
  renderEvent,
  components,
  customHeader,
  eventExtraProps,
}) => {
  const { isMobileLayout } = useViewport();
  const {
    onSelectDayCallBack,
    startDate,
    endDate,
    availableOrderDetailCheckList,
  } = resources || ({} as any);
  const { handleSelectDay } = useSelectDay();

  const startDateTimestamp =
    startDate instanceof Date ? startDate?.getTime() : undefined;
  const endDateTimestamp =
    endDate instanceof Date ? endDate?.getTime() : undefined;
  const dateTimestamp = date.getTime();

  const isDisabled =
    startDateTimestamp && endDateTimestamp
      ? dateTimestamp < startDateTimestamp || dateTimestamp > endDateTimestamp
      : false;

  const indicator =
    !isMobileLayout ||
    (availableOrderDetailCheckList?.[date.getTime()]?.isAvailable &&
      availableOrderDetailCheckList?.[date.getTime()]?.status ===
        EInvalidRestaurantCase.noMenusValid)
      ? undefined
      : availableOrderDetailCheckList?.[date.getTime()]?.isAvailable;

  const onClick = useCallback(() => {
    if (isDisabled) {
      return;
    }
    handleSelectDay?.(date);
    onSelectDayCallBack?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, handleSelectDay]);

  return (
    <div
      className={css.weekDay}
      id={`dayHeader-${date.getDay()}`}
      onClick={onClick}>
      {customHeader ? (
        customHeader({
          date,
        })
      ) : (
        <DayItemHeader
          date={date}
          resources={resources}
          isDisabled={isDisabled}
          indicator={indicator}
        />
      )}
      {!isMobileLayout && (
        <DayItemContent
          date={date}
          events={events}
          resources={resources}
          renderEvent={renderEvent}
          eventExtraProps={eventExtraProps}
          components={components}
        />
      )}
    </div>
  );
};

export default WDayItem;
