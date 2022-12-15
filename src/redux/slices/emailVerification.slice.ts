import type { ThunkAPI } from '@redux/store';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { storableError } from '@utils/errors';

import { userThunks } from './user.slice';

// ================ Action types ================ //
export const VERIFICATION = 'app/EmailVerification/VERIFICATION';

type TEmailVerification = {
  isVerified: boolean;
  // verification
  verificationError: any;
  verificationInProgress: boolean;
};

const initialState: TEmailVerification = {
  isVerified: false,
  verificationError: null,
  verificationInProgress: false,
};
// ================ Selectors ================ //

export const verificationInProgress = (state: any) => {
  return state.emailVerification.verificationInProgress;
};

// ================ Thunks ================ //

const verify = createAsyncThunk(
  VERIFICATION,
  async (
    params: Record<string, any>,
    { dispatch, extra: sdk, fulfillWithValue, rejectWithValue }: ThunkAPI,
  ) => {
    try {
      const { verificationToken } = params;
      await sdk.currentUser.verifyEmail({ verificationToken });
      fulfillWithValue(undefined);
      dispatch(userThunks.fetchCurrentUser(undefined));
    } catch (error) {
      return rejectWithValue(storableError(error));
    }
  },
);

export const emailVerificationThunks = {
  verify,
};

const emailVerificationSlice = createSlice({
  name: 'EmailVerification',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(verify.pending, (state) => {
      return {
        ...state,
        verificationInProgress: true,
        verificationError: null,
      };
    });
    builder.addCase(verify.fulfilled, (state) => {
      return { ...state, verificationInProgress: false, isVerified: true };
    });
    builder.addCase(verify.rejected, (state, action) => {
      return {
        ...state,
        verificationInProgress: false,
        verificationError: action.payload,
      };
    });
  },
});

export default emailVerificationSlice.reducer;
