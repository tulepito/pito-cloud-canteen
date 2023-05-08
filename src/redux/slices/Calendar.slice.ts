import { createSlice } from '@reduxjs/toolkit';

// ================ Initial states ================ //
type TCalendarState = {
  selectedDay: Date;
};
const initialState: TCalendarState = {
  selectedDay: null!,
};

// ================ Thunk types ================ //

// ================ Async thunks ================ //

export const CalendarThunks = {};

// ================ Slice ================ //
const CalendarSlice = createSlice({
  name: 'Calendar',
  initialState,
  reducers: {
    setSelectedDay: (state, action) => {
      state.selectedDay = action.payload;
    },
  },
  extraReducers: () => {},
});

// ================ Actions ================ //
export const CalendarActions = CalendarSlice.actions;
export default CalendarSlice.reducer;

// ================ Selectors ================ //
