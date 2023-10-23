import { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { CalendarActions } from '@redux/slices/Calendar.slice';

const useSelectDay = () => {
  const dispatch = useAppDispatch();

  const selectedDay = useAppSelector((state) => state.Calendar.selectedDay);

  const handleSelectDay = useCallback((day: Date) => {
    dispatch(CalendarActions.setSelectedDay(day));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    selectedDay,
    handleSelectDay,
  };
};

export default useSelectDay;
