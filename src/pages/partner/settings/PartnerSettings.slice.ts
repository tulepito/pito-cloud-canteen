import { createSlice } from '@reduxjs/toolkit';

import { fetchSearchFilterApi } from '@apis/userApi';
import { createAsyncThunk } from '@redux/redux.helper';
import { userThunks } from '@redux/slices/user.slice';
import type { TKeyValue } from '@src/utils/types';

// ================ Initial states ================ //
type TPartnerSettingsState = {
  nutritions: TKeyValue[];
  fetchAttributesInProgress: boolean;
  fetchAttributesError: any;

  updateSpecialDemandInProgress: boolean;
  updateSpecialDemandError: any;

  updateProfileInProgress: boolean;
  updateProfileError: any;

  changePasswordInProgress: boolean;
  changePasswordError: any;

  updateProfileImageInProgress: boolean;
  updateProfileImageError: any;
};
const initialState: TPartnerSettingsState = {
  nutritions: [],
  fetchAttributesInProgress: false,
  fetchAttributesError: null,

  updateSpecialDemandInProgress: false,
  updateSpecialDemandError: null,

  updateProfileInProgress: false,
  updateProfileError: null,

  changePasswordInProgress: false,
  changePasswordError: null,

  updateProfileImageInProgress: false,
  updateProfileImageError: null,
};

// ================ Thunk types ================ //
const FETCH_ATTRIBUTES = 'app/PartnerSettings/FETCH_ATTRIBUTES';
const UPDATE_SPECIAL_DEMAND = 'app/PartnerSettings/UPDATE_SPECIAL_DEMAND';
const UPDATE_PROFILE = 'app/PartnerSettings/UPDATE_PROFILE';
const UPDATE_PROFILE_IMAGE = 'app/PartnerSettings/UPDATE_PROFILE_IMAGE';
// ================ Async thunks ================ //

const fetchAttributes = createAsyncThunk(FETCH_ATTRIBUTES, async () => {
  const { data: response } = await fetchSearchFilterApi();

  return response;
});

const updateSpecialDemand = createAsyncThunk(
  UPDATE_SPECIAL_DEMAND,
  async (
    payload: { allergies?: string[]; nutritions?: string[] },
    { extra: sdk },
  ) => {
    const { allergies, nutritions: newNutritions } = payload;
    await sdk.currentUser.updateProfile({
      publicData: {
        allergies,
        nutritions: newNutritions,
      },
    });
  },
);

const updateProfile = createAsyncThunk(
  UPDATE_PROFILE,
  async (
    payload: {
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
    },
    { extra: sdk, dispatch },
  ) => {
    const { firstName, lastName, phoneNumber } = payload;
    await sdk.currentUser.updateProfile({
      firstName,
      lastName,
      protectedData: {
        phoneNumber,
      },
    });

    await dispatch(userThunks.fetchCurrentUser());
  },
);

const updateProfileImage = createAsyncThunk(
  UPDATE_PROFILE_IMAGE,
  async (profileImageId: string, { extra: sdk, dispatch }) => {
    await sdk.currentUser.updateProfile({
      profileImageId,
    });
    await dispatch(userThunks.fetchCurrentUser());
  },
);

export const PartnerSettingsThunks = {
  fetchAttributes,
  updateSpecialDemand,
  updateProfile,
  updateProfileImage,
};

// ================ Slice ================ //
const PartnerSettingsSlice = createSlice({
  name: 'PartnerSettings',
  initialState,
  reducers: {
    clearChangePasswordError: (state) => {
      state.changePasswordError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttributes.pending, (state) => {
        state.fetchAttributesInProgress = true;
        state.fetchAttributesError = false;
      })
      .addCase(fetchAttributes.fulfilled, (state, action) => {
        const { nutritions = [] } = action.payload;
        state.nutritions = nutritions;
        state.fetchAttributesInProgress = false;
      })
      .addCase(fetchAttributes.rejected, (state) => {
        state.fetchAttributesInProgress = false;
        state.fetchAttributesError = true;
      })

      .addCase(updateSpecialDemand.pending, (state) => {
        state.updateSpecialDemandInProgress = true;
        state.updateSpecialDemandError = false;
      })
      .addCase(updateSpecialDemand.fulfilled, (state) => {
        state.updateSpecialDemandInProgress = false;
      })
      .addCase(updateSpecialDemand.rejected, (state) => {
        state.updateSpecialDemandInProgress = false;
        state.updateSpecialDemandError = true;
      })

      .addCase(updateProfile.pending, (state) => {
        state.updateProfileInProgress = true;
        state.updateProfileError = false;
      })
      .addCase(updateProfile.fulfilled, (state) => {
        state.updateProfileInProgress = false;
      })
      .addCase(updateProfile.rejected, (state) => {
        state.updateProfileInProgress = false;
        state.updateProfileError = true;
      })

      .addCase(updateProfileImage.pending, (state) => {
        state.updateProfileImageInProgress = true;
        state.updateProfileImageError = false;
      })
      .addCase(updateProfileImage.fulfilled, (state) => {
        state.updateProfileImageInProgress = false;
      })
      .addCase(updateProfileImage.rejected, (state) => {
        state.updateProfileImageInProgress = false;
        state.updateProfileImageError = true;
      });
  },
});

// ================ Actions ================ //
export const PartnerSettingsActions = PartnerSettingsSlice.actions;
export default PartnerSettingsSlice.reducer;

// ================ Selectors ================ //
