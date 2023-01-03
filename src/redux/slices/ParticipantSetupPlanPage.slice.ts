import { createAsyncThunk } from '@redux/redux.helper';
import { createSlice } from '@reduxjs/toolkit';
import { storableError } from '@utils/errors';

import { loadPlanDataApi } from '../../utils/api';

const LOAD_DATA = 'app/ParticipantSetupPlanPage/LOAD_DATA';

interface ParticipantSetupPlanState {
  restaurant: any;
  company: any;
  plan: any;
  order: any;
  loadDataInProgress: boolean;
  loadDataError: any;
}

const initialState: ParticipantSetupPlanState = {
  restaurant: {},
  company: {},
  plan: {},
  order: {},
  loadDataInProgress: false,
  loadDataError: null,
};

const loadData = createAsyncThunk(
  LOAD_DATA,
  async (planId: string) => {
    console.log({ planId });
    const response: any = await loadPlanDataApi(planId);
    return response?.data?.data;
  },
  {
    serializeError: storableError,
  },
);

export const ParticipantSetupPlanThunks = { loadData };

const participantSetupPlanSlice = createSlice({
  name: 'ParticipantSetupPlanPage',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadData.pending, (state) => {
        return {
          ...state,
          loadDataInProgress: true,
          loadDataError: null,
        };
      })
      .addCase(loadData.fulfilled, (state, { payload }) => {
        return {
          ...state,
          ...payload,
          loadDataInProgress: false,
        };
      })
      .addCase(loadData.rejected, (state, { error }) => ({
        ...state,
        loadDataError: error.message,
        loadDataInProgress: false,
      }));
  },
});

export default participantSetupPlanSlice.reducer;
