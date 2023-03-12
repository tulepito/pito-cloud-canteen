import { createSlice } from '@reduxjs/toolkit';

import { createAsyncThunk } from '@redux/redux.helper';
import { storableError } from '@utils/errors';
import type { TObject } from '@utils/types';

type TPasswordSliceInitialState = {
  initialEmail: string | null;
  submittedEmail: string | null;
  recoveryError: any;
  recoveryInProgress: boolean;
  passwordRequested: boolean;
  resetPasswordInProgress: boolean;
  resetPasswordError: any;
};

const initialState: TPasswordSliceInitialState = {
  initialEmail: null,
  submittedEmail: null,
  recoveryError: null,
  recoveryInProgress: false,
  passwordRequested: false,
  resetPasswordInProgress: false,
  resetPasswordError: null,
};

// ================ Thunk ================ //
const PASSWORD_RECOVERY = 'app/Password/Recovery';
const PASSWORD_RESET = 'app/Password/Reset';

const recoverPassword = createAsyncThunk(
  PASSWORD_RECOVERY,
  async (
    params: TObject,
    { extra: sdk, fulfillWithValue, rejectWithValue },
  ) => {
    const { email } = params;

    try {
      sdk.passwordReset.request({ email });

      return fulfillWithValue({ email });
    } catch (error) {
      return rejectWithValue({ error: storableError(error), email });
    }
  },
);

const resetPassword = createAsyncThunk(
  PASSWORD_RESET,
  async (params: TObject, { extra: sdk }) => {
    const { email, passwordResetToken, newPassword } = params;
    const requestParams = { email, passwordResetToken, newPassword };

    await sdk.passwordReset.reset(requestParams);
  },
  {
    serializeError: storableError,
  },
);

export const passwordThunks = {
  recoverPassword,
  resetPassword,
};

const passwordSlice = createSlice({
  name: 'PasswordRecovery',
  initialState,
  reducers: {
    retypePasswordRecoveryEmail: (state) => {
      return {
        ...state,
        initialEmail: state.submittedEmail,
        submittedEmail: null,
        passwordRequested: false,
      };
    },
    clearPasswordRecoveryError: (state) => {
      state.recoveryError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(recoverPassword.pending, (state) => {
        return {
          ...state,
          submittedEmail: null,
          recoveryInProgress: true,
          recoveryError: null,
        };
      })
      .addCase(recoverPassword.fulfilled, (state, action) => {
        return {
          ...state,
          submittedEmail: action.payload.email,
          initialEmail: action.payload.email,
          recoveryInProgress: false,
          passwordRequested: true,
        };
      })
      .addCase(recoverPassword.rejected, (state, { payload }: any) => {
        return {
          ...state,
          recoveryInProgress: false,
          recoveryError: payload.error,
          initialEmail: payload.email,
        };
      })

      .addCase(resetPassword.pending, (state) => {
        return {
          ...state,
          resetPasswordInProgress: true,
          resetPasswordError: null,
        };
      })
      .addCase(resetPassword.fulfilled, (state) => {
        return { ...state, resetPasswordInProgress: false };
      })
      .addCase(resetPassword.rejected, (state, action) => {
        return {
          ...state,
          resetPasswordInProgress: false,
          resetPasswordError: action.error,
        };
      });
  },
});

export const passwordActions = passwordSlice.actions;
export default passwordSlice.reducer;
