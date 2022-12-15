import type { ThunkAPI } from '@redux/store';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { storableError } from '@utils/errors';

// ================ Thunk types ================ //
const PASSWORD_RECOVERY = 'app/Password/Recovery';
const PASSWORD_RESET = 'app/Password/Reset';

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

const recoverPassword = createAsyncThunk(
  PASSWORD_RECOVERY,
  async (
    params: Record<string, any>,
    { extra: sdk, fulfillWithValue, rejectWithValue }: ThunkAPI,
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
  async (
    params: Record<string, any>,
    { extra: sdk, fulfillWithValue, rejectWithValue }: ThunkAPI,
  ) => {
    const { email, passwordResetToken, newPassword } = params;
    const requestParams = { email, passwordResetToken, newPassword };

    try {
      await sdk.passwordReset.reset(requestParams);
      return fulfillWithValue();
    } catch (error) {
      return rejectWithValue(storableError(error));
    }
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
      return { ...state, recoveryError: null };
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
          resetPasswordError: action.payload,
        };
      });
  },
});

export const passwordActions = passwordSlice.actions;
export default passwordSlice.reducer;
