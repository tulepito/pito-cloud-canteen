import type { TCalendarItemCardComponents } from '@components/CalendarDashboard/helpers/types';

import MonthView from './MonthView';

const createMonthViewWrapper = ({
  renderEvent,
  customComponents,
}: {
  renderEvent: any;
  customComponents?: TCalendarItemCardComponents;
}) => {
  const MonthViewWrapper = (props: any) => (
    <MonthView
      {...props}
      renderEvent={renderEvent}
      customComponents={customComponents}
    />
  );
  MonthViewWrapper.title = MonthView.title;
  MonthViewWrapper.range = MonthView.range;
  MonthViewWrapper.navigate = MonthView.navigate;

  return MonthViewWrapper;
};

export default createMonthViewWrapper;
