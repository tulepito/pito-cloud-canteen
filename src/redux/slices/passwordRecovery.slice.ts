import type { ThunkAPI } from '@redux/store';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { storableError } from '@utils/errors';

// ================ Thunk types ================ //
const PASSWORD_RECOVERY = 'app/PasswordRecovery';

type TPasswordRecoverySliceInitialState = {
  initialEmail: string | null;
  submittedEmail: string | null;
  recoveryError: any;
  recoveryInProgress: boolean;
  passwordRequested: boolean;
};

const initialState: TPasswordRecoverySliceInitialState = {
  initialEmail: null,
  submittedEmail: null,
  recoveryError: null,
  recoveryInProgress: false,
  passwordRequested: false,
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

export const recoverPasswordThunks = {
  recoverPassword,
};

const passwordRecoverySlice = createSlice({
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
      });
  },
});

export const passwordRecoveryActions = passwordRecoverySlice.actions;
export default passwordRecoverySlice.reducer;
