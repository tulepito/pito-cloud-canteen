import { createSlice } from '@reduxjs/toolkit';
import type { Step } from 'react-joyride';

// ================ Initial states ================ //
type TWalkthroughState = {
  run: boolean;
  steps: Step[];
};

const initialState: TWalkthroughState = {
  run: true,
  steps: [],
};

// ================ Thunk types ================ //

// ================ Async thunks ================ //
export const walkthroughThunks = {};

// ================ Slice ================ //
const walkthroughSlice = createSlice({
  name: 'walkthrough',
  initialState,
  reducers: {
    addSteps: (state, { payload }: { payload: Step[] }) => {
      return {
        ...state,
        steps: payload,
      };
    },
    removeSteps: (state) => {
      state.steps = [];
    },
    activeRun: (state) => {
      state.run = true;
    },
    deactiveRun: (state) => {
      state.run = false;
    },
  },
  extraReducers: () => {},
});

// ================ Actions ================ //
export const walkthroughAction = walkthroughSlice.actions;
export default walkthroughSlice.reducer;

// ================ Selectors ================ //
