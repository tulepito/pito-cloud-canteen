import { createSlice } from '@reduxjs/toolkit';

import { createAsyncThunk } from '@redux/redux.helper';
import { EHttpStatusCode, storableError } from '@utils/errors';
import type { TObject } from '@utils/types';

type TPasswordSliceInitialState = {
  initialEmail: string | null;
  submittedEmail: string | null;
  changePasswordInProgress: boolean;
  changePasswordError: any;
  recoveryError: any;
  recoveryInProgress: boolean;
  passwordRequested: boolean;
  resetPasswordInProgress: boolean;
  resetPasswordError: any;
};

const initialState: TPasswordSliceInitialState = {
  initialEmail: null,
  submittedEmail: null,
  changePasswordInProgress: false,
  changePasswordError: null,
  recoveryError: null,
  recoveryInProgress: false,
  passwordRequested: false,
  resetPasswordInProgress: false,
  resetPasswordError: null,
};

// ================ Thunk ================ //
const PASSWORD_RECOVERY = 'app/Password/Recovery';
const PASSWORD_RESET = 'app/Password/Reset';
const CHANGE_PASSWORD = 'app/Password/Change_Password';

const changePassword = createAsyncThunk(
  CHANGE_PASSWORD,
  async (
    payload: { currentPassword: string; newPassword: string },
    { extra: sdk, rejectWithValue, fulfillWithValue },
  ) => {
    try {
      await sdk.currentUser.changePassword(payload);

      return fulfillWithValue(null);
    } catch (error) {
      return rejectWithValue(storableError(error));
    }
  },
);

const recoverPassword = createAsyncThunk(
  PASSWORD_RECOVERY,
  async (
    params: TObject,
    { extra: sdk, fulfillWithValue, rejectWithValue },
  ) => {
    const { email } = params;

    try {
      await sdk.passwordReset.request({ email });

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
  changePassword,
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
    clearChangePasswordError: (state) => {
      state.changePasswordError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(changePassword.pending, (state) => {
        state.changePasswordInProgress = true;
        state.changePasswordError = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.changePasswordInProgress = false;
      })
      .addCase(changePassword.rejected, (state, { payload }) => {
        state.changePasswordInProgress = false;
        state.changePasswordError = payload;
      })

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
        const { status } = payload?.error || {};
        const recoveryError =
          status === EHttpStatusCode.Conflict
            ? 'Email không tồn tại trong hệ thống. Vui lòng kiểm tra và thử lại.'
            : 'Đã xảy ra lỗi trong quá trình đặt lại mật khẩu. Vui lòng thử lại sau.';

        return {
          ...state,
          recoveryInProgress: false,
          recoveryError,
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
