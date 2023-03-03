import { createSlice } from '@reduxjs/toolkit';

import { createAsyncThunk } from '@redux/redux.helper';
import { storableError } from '@utils/errors';
import type { TObject } from '@utils/types';

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
  async (params: TObject, { dispatch, extra: sdk }) => {
    const { verificationToken } = params;
    await sdk.currentUser.verifyEmail({ verificationToken });
    dispatch(userThunks.fetchCurrentUser());
    return undefined;
  },
  {
    serializeError: storableError,
  },
);

export const emailVerificationThunks = {
  verify,
};

const emailVerificationSlice = createSlice({
  name: 'EmailVerification',
  initialState,
  reducers: {
    updateVerificationState(state, { payload }) {
      state.isVerified = payload;
    },
  },
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
    builder.addCase(verify.rejected, (state, { error }) => {
      return {
        ...state,
        verificationInProgress: false,
        verificationError: error,
      };
    });
  },
});

export const emailVerificationActions = emailVerificationSlice.actions;
export default emailVerificationSlice.reducer;
