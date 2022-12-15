import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { ThunkAPI } from './types';

interface UserState {
  currentUser: any;
}
const initialState: UserState = {
  currentUser: null,
};

const CURRENT_USER = 'app/User/CURRENT_USER';

export const fetchCurrentUser = createAsyncThunk(
  CURRENT_USER,
  async (_, { extra: sdk, getState }: ThunkAPI) => {
    const { isAuthenticated } = getState().auth;
    if (!isAuthenticated) {
      return false;
    }
    const response = await sdk.currentUser.show();
    return response.data.data;
  },
);
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    currentUserShowSuccess: (state, { payload }) => {
      return {
        ...state,
        currentUser: payload,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.rejected, (state, { payload }: any) => {
        return {
          ...state,
          currentUser: payload,
        };
      })
      .addCase(fetchCurrentUser.fulfilled, (state, { payload }: any) => {
        return {
          ...state,
          currentUser: payload,
        };
      });
  },
});

export default userSlice.reducer;
