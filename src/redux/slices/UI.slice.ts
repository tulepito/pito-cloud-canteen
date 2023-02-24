import { createSlice } from '@reduxjs/toolkit';

// ================ Initial states ================ //
type TUIState = {
  openingModalIdList: string[];
};
const initialState: TUIState = {
  openingModalIdList: [],
};

// ================ Thunk types ================ //

// ================ Async thunks ================ //
export const UIThunks = {};

// ================ Slice ================ //
const UISlice = createSlice({
  name: 'UI',
  initialState,
  reducers: {
    disableScrollRequest: (state, { payload }) => {
      state.openingModalIdList = Array.from(
        new Set(state.openingModalIdList).add(payload),
      );
    },
    disableScrollRemove: (state, { payload }) => {
      state.openingModalIdList = state.openingModalIdList.filter(
        (id) => id !== payload,
      );
    },
  },
  extraReducers: () => {},
});

// ================ Actions ================ //
export const UIActions = UISlice.actions;
export default UISlice.reducer;

// ================ Selectors ================ //
