import MonthView from './MonthView';

const createMonthViewWrapper = (renderEvent: any) => {
  const MonthViewWrapper = (props: any) => (
    <MonthView {...props} renderEvent={renderEvent} />
  );
  MonthViewWrapper.title = MonthView.title;
  MonthViewWrapper.range = MonthView.range;
  MonthViewWrapper.navigate = MonthView.navigate;

  return MonthViewWrapper;
};

export default createMonthViewWrapper;
