import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

interface CompanyState {
  companyName: string;
}

// ================ Thunk types ================ //
const GROUP_INFO = 'app/Company/GROUP_INFO';

const initialState: CompanyState = {
  companyName: '',
};

const groupInfo = createAsyncThunk(GROUP_INFO, async () => {});
export const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    addCompanyName: (state, action) => {
      return {
        ...state,
        companyName: action.payload,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(groupInfo.pending, (state) => state)
      .addCase(groupInfo.fulfilled, (state, { payload }) => {
        return {
          ...state,
          groupList: payload,
        };
      });
  },
});

export const { addCompanyName } = companySlice.actions;

export default companySlice.reducer;
