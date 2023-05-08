import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { CalendarActions } from '@redux/slices/Calendar.slice';

const useSelectDay = () => {
  const dispatch = useAppDispatch();

  const selectedDay = useAppSelector((state) => state.Calendar.selectedDay);

  const handleSelectDay = (day: Date) => {
    dispatch(CalendarActions.setSelectedDay(day));
  };

  return {
    selectedDay,
    handleSelectDay,
  };
};

export default useSelectDay;
