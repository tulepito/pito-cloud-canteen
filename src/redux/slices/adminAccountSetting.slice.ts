import { createSlice } from '@reduxjs/toolkit';

import { createAsyncThunk } from '@redux/redux.helper';
import { storableError } from '@src/utils/errors';
import type { TObject } from '@src/utils/types';

import { userThunks } from './user.slice';

// ================ Initial states ================ //

type TAdminAccountSetting = {
  updateInProgress: boolean;
  updateError: any;
  changingPassword: boolean;
  changePasswordError: any;
};
const initialState: TAdminAccountSetting = {
  updateInProgress: false,
  updateError: null,
  changingPassword: false,
  changePasswordError: null,
};

// ================ Thunk types ================ //

const updateAdminAccount = createAsyncThunk(
  'app/adminAccountSetting/UPDATE_ADMIN_ACCOUNT',
  async (params: TObject, { extra: sdk, dispatch }) => {
    const { data: response } = await sdk.currentUser.updateProfile(params);
    await dispatch(userThunks.fetchCurrentUser());

    return response;
  },
  {
    serializeError: storableError,
  },
);

const adminChangePassword = createAsyncThunk(
  'app/adminAccountSetting/ADMIN_CHANGE_PASSWORD',
  async (params: TObject, { extra: sdk }) => {
    const response = await sdk.currentUser.changePassword(params, {
      expand: true,
    });

    return response;
  },
  {
    serializeError: storableError,
  },
);

export const adminAccountSettingThunks = {
  updateAdminAccount,
  adminChangePassword,
};

// ================ Slice ================ //
const AdminAccountSettingSlice = createSlice({
  name: 'Attributes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(updateAdminAccount.pending, (state) => {
        state.updateInProgress = true;
        state.updateError = null;
      })
      .addCase(updateAdminAccount.fulfilled, (state) => {
        state.updateInProgress = false;
      })
      .addCase(updateAdminAccount.rejected, (state, { error }) => {
        state.updateInProgress = false;
        state.updateError = error;
      })
      .addCase(adminChangePassword.pending, (state) => {
        state.changingPassword = true;
        state.changePasswordError = null;
      })
      .addCase(adminChangePassword.fulfilled, (state) => {
        state.changingPassword = false;
      })
      .addCase(adminChangePassword.rejected, (state, { error }) => {
        state.changePasswordError = error;
        state.changingPassword = false;
      });
  },
});

// ================ Actions ================ //
export const AttributesActions = AdminAccountSettingSlice.actions;
export default AdminAccountSettingSlice.reducer;

// ================ Selectors ================ //
