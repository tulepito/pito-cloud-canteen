import type { TCalendarItemCardComponents } from '../../helpers/types';
import WeekView from './WeekView';

const withWeekViewWrapper = ({
  renderEvent,
  customComponents,
}: {
  renderEvent: any;
  customComponents?: TCalendarItemCardComponents;
}) => {
  const WeekViewWrapper = (props: any) => {
    return (
      <WeekView
        {...props}
        renderEvent={renderEvent}
        customComponents={customComponents}
      />
    );
  };
  WeekViewWrapper.title = WeekView.title;
  WeekViewWrapper.range = WeekView.range;
  WeekViewWrapper.navigate = WeekView.navigate;

  return WeekViewWrapper;
};

export default withWeekViewWrapper;
