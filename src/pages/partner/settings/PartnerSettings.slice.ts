import { createSlice } from '@reduxjs/toolkit';

import { fetchSearchFilterApi } from '@apis/userApi';
import { createAsyncThunk } from '@redux/redux.helper';
import { CurrentUser, denormalisedResponseEntities } from '@src/utils/data';
import type { TCurrentUser, TKeyValue } from '@src/utils/types';

// ================ Initial states ================ //
type TPartnerSettingsState = {
  nutritions: TKeyValue[];
  fetchDataInProgress: boolean;
  fetchDataError: any;

  fetchAttributesInProgress: boolean;
  fetchAttributesError: any;
};
const initialState: TPartnerSettingsState = {
  nutritions: [],
  fetchDataInProgress: false,
  fetchDataError: null,

  fetchAttributesInProgress: false,
  fetchAttributesError: null,
};

// ================ Thunk types ================ //
const FETCH_ATTRIBUTES = 'app/PartnerSettings/FETCH_ATTRIBUTES';

// ================ Async thunks ================ //

const loadData = createAsyncThunk(
  'app/PartnerSettings/LOAD_DATA',
  async (_, { extra: sdk, getState }) => {
    const { currentUser } = getState().user;

    const { restaurantListingId } = CurrentUser(
      currentUser as TCurrentUser,
    ).getMetadata();

    const restaurantResponse = await sdk.ownListings.show({
      id: restaurantListingId,
      include: ['author', 'author.profileImage', 'images'],
      'fields.image': [
        // Listing page
        'variants.landscape-crop',
        'variants.landscape-crop2x',
        'variants.landscape-crop4x',
        'variants.landscape-crop6x',

        // Social media
        'variants.facebook',
        'variants.twitter',

        // Image carousel
        'variants.scaled-small',
        'variants.scaled-medium',
        'variants.scaled-large',
        'variants.scaled-xlarge',

        // Avatars
        'variants.square-small',
        'variants.square-small2x',
      ],
    });

    return denormalisedResponseEntities(restaurantResponse)[0];
  },
);

const fetchAttributes = createAsyncThunk(FETCH_ATTRIBUTES, async () => {
  const { data: response } = await fetchSearchFilterApi();

  return response;
});

export const PartnerSettingsThunks = { loadData, fetchAttributes };

// ================ Slice ================ //
const PartnerSettingsSlice = createSlice({
  name: 'PartnerSettings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      /* =============== loadData =============== */
      .addCase(loadData.pending, (state) => {
        state.fetchDataError = null;
        state.fetchDataInProgress = true;
      })
      .addCase(loadData.fulfilled, (state) => {
        state.fetchDataInProgress = false;
      })
      .addCase(loadData.rejected, (state, { payload }) => {
        state.fetchDataInProgress = false;
        state.fetchDataError = payload;
      })
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
      });
  },
});

// ================ Actions ================ //
export const PartnerSettingsActions = PartnerSettingsSlice.actions;
export default PartnerSettingsSlice.reducer;

// ================ Selectors ================ //
