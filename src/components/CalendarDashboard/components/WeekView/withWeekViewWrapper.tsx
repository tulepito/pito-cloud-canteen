import WeekView from './WeekView';

const withWeekViewWrapper = (renderEvent: any) => {
  const WeekViewWrapper = (props: any) => (
    <WeekView {...props} renderEvent={renderEvent} />
  );
  WeekViewWrapper.title = WeekView.title;
  WeekViewWrapper.range = WeekView.range;
  WeekViewWrapper.navigate = WeekView.navigate;

  return WeekViewWrapper;
};

export default withWeekViewWrapper;
