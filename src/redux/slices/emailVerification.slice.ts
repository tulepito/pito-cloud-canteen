import { createAsyncThunk } from '@redux/redux.helper';
import { createSlice } from '@reduxjs/toolkit';
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
    { dispatch, extra: sdk, fulfillWithValue },
  ) => {
    const { verificationToken } = params;
    await sdk.currentUser.verifyEmail({ verificationToken });
    fulfillWithValue(undefined);
    dispatch(userThunks.fetchCurrentUser(undefined));
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
        verificationError: action.error,
      };
    });
  },
});

export default emailVerificationSlice.reducer;
