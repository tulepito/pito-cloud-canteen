import { createSlice } from '@reduxjs/toolkit';
import omit from 'lodash/omit';

import { toggleAppStatusApi } from '@apis/partnerApi';
import { queryAllPages } from '@helpers/apiHelpers';
import { createSubmitUpdatePartnerValues } from '@helpers/partnerHelper';
import { createAsyncThunk } from '@redux/redux.helper';
import {
  CurrentUser,
  denormalisedResponseEntities,
  Listing,
} from '@src/utils/data';
import { EImageVariants } from '@src/utils/enums';
import { storableError } from '@src/utils/errors';
import { pickRenderableImagesByProperty } from '@src/utils/images';
import { ETransition } from '@src/utils/transaction';
import type { TCurrentUser, TObject, TOwnListing } from '@src/utils/types';

// ================ Initial states ================ //
type TPartnerSettingsState = {
  restaurantListing: TOwnListing | null;
  fetchDataInProgress: boolean;
  fetchDataError: any;

  uploadedAvatars: any;
  uploadedAvatarsOrder: any[];
  removedAvatarIds: any[];
  uploadAvatarError: any;
  uploadingAvatars: boolean;

  uploadedCovers: any;
  uploadedCoversOrder: any[];
  removedCoverIds: any[];
  uploadCoverError: any;
  uploadingCovers: boolean;

  removedImageIds: any[];

  // update
  updateRestaurantInprogress: boolean;
  updateRestaurantError: any;

  // inprogress transactions
  inProgressTransactions: any[];

  // toggle app
  toggleAppStatusInProgress: boolean;
  toggleAppStatusError: any;
};
const initialState: TPartnerSettingsState = {
  restaurantListing: null,
  fetchDataInProgress: false,
  fetchDataError: null,

  // Handle upload image
  uploadedAvatars: {},
  uploadedAvatarsOrder: [],
  removedAvatarIds: [],
  uploadAvatarError: null,
  uploadingAvatars: false,

  uploadedCovers: {},
  uploadedCoversOrder: [],
  removedCoverIds: [],
  uploadCoverError: null,
  uploadingCovers: false,

  removedImageIds: [],
  // update
  updateRestaurantInprogress: false,
  updateRestaurantError: null,

  inProgressTransactions: [],

  // toggle app
  toggleAppStatusInProgress: false,
  toggleAppStatusError: null,
};

// ================ Thunk types ================ //

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
      include: ['images'],
      'fields.image': [
        // Listing page
        'variants.landscape-crop',
        'variants.landscape-crop2x',
        'variants.landscape-crop4x',
        'variants.landscape-crop6x',
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

    const inProgressTransactions = await queryAllPages({
      sdkModel: sdk.transactions,
      query: {
        listingId: restaurantListingId,
        lastTransitions: ETransition.PARTNER_CONFIRM_SUB_ORDER,
      },
      include: ['booking'],
    });

    return {
      restaurantListing: denormalisedResponseEntities(restaurantResponse)[0],
      inProgressTransactions,
    };
  },
);

const updatePartnerRestaurantListing = createAsyncThunk(
  'app/PartnerSettings/UPDATE_PARTNER_RESTAURANT_LISTING',
  async (
    values: any,
    { extra: sdk, fulfillWithValue, rejectWithValue, getState },
  ) => {
    try {
      const { restaurantListing } = getState().PartnerSettingsPage;

      const submitValues = createSubmitUpdatePartnerValues(
        {
          ...values,
          ...(restaurantListing ? { id: restaurantListing.id.uuid } : {}),
          oldImages: restaurantListing?.images,
        },
        restaurantListing,
      );

      const data = await sdk.ownListings.update(submitValues, {
        include: ['images'],
        'fields.image': [
          // Listing page
          'variants.landscape-crop',
          'variants.landscape-crop2x',
          'variants.landscape-crop4x',
          'variants.landscape-crop6x',
          // Image carousel
          'variants.scaled-small',
          'variants.scaled-medium',
          'variants.scaled-large',
          'variants.scaled-xlarge',
          // Avatars
          'variants.square-small',
          'variants.square-small2x',
        ],
        expand: true,
      });
      const [restaurant] = denormalisedResponseEntities(data);

      return fulfillWithValue(restaurant);
    } catch (error) {
      console.error(error);

      return rejectWithValue(storableError(error));
    }
  },
);

const uploadAvatar = createAsyncThunk(
  'app/PartnerSettings/REQUEST_AVATAR_UPLOAD',
  async (
    payload: TObject,
    { extra: sdk, fulfillWithValue, rejectWithValue, getState, dispatch },
  ) => {
    const {
      restaurantListing,
      uploadedAvatarsOrder,
      removedAvatarIds,
      removedImageIds,
    } = getState().PartnerSettingsPage;

    const { file, id } = payload || {};
    try {
      const response = await sdk.images.upload(
        { image: file },
        {
          expand: true,
          'fields.image': ['variants.square-small', 'variants.square-small2x'],
        },
      );
      const img = response.data.data;
      const imgObj = { ...img, id, imageId: img.id };

      await dispatch(
        updatePartnerRestaurantListing({
          uploadedAvatars: pickRenderableImagesByProperty(
            restaurantListing,
            { [id]: imgObj },
            uploadedAvatarsOrder,
            removedAvatarIds,
            'avatarImageId',
          ),
          removedImageIds,
        }),
      );

      return fulfillWithValue(imgObj);
    } catch (error) {
      console.error('error', error);

      return rejectWithValue({ id, error: storableError(error) });
    }
  },
);

const uploadCover = createAsyncThunk(
  'app/PartnerSettings/REQUEST_COVER_UPLOAD',
  async (
    payload: TObject,
    { extra: sdk, fulfillWithValue, rejectWithValue, getState, dispatch },
  ) => {
    const {
      restaurantListing,
      uploadedCoversOrder,
      removedCoverIds,
      removedImageIds,
    } = getState().PartnerSettingsPage;

    const { file, id } = payload || {};
    try {
      const response = await sdk.images.upload(
        { image: file },
        {
          expand: true,
          'fields.image': [
            `variants.${EImageVariants.scaledLarge}`,
            `variants.${EImageVariants.landscapeCrop2x}`,
            `variants.${EImageVariants.scaledMedium}`,
            `variants.${EImageVariants.scaledXLarge}`,
          ],
        },
      );
      const img = response.data.data;
      const imgObj = { ...img, id, imageId: img.id };

      await dispatch(
        updatePartnerRestaurantListing({
          uploadedCovers: pickRenderableImagesByProperty(
            restaurantListing,
            { [id]: imgObj },
            uploadedCoversOrder,
            removedCoverIds,
            'coverImageId',
          ),
          removedImageIds,
        }),
      );

      return fulfillWithValue(imgObj);
    } catch (error) {
      console.error(error);

      return rejectWithValue({ id, error: storableError(error) });
    }
  },
);

const toggleRestaurantActiveStatus = createAsyncThunk(
  'app/PartnerSettings/TOGGLE_RESTAURANT_ACTIVE_STATUS',
  async (_: TObject | undefined, { rejectWithValue, getState, dispatch }) => {
    try {
      const { restaurantListing } = getState().PartnerSettingsPage;
      const restaurantGetter = Listing(restaurantListing);
      const restaurantId = restaurantGetter.getId();
      const { isActive = true } = Listing(restaurantListing).getPublicData();

      await dispatch(updatePartnerRestaurantListing({ isActive: !isActive }));

      await toggleAppStatusApi(
        {
          partnerId: restaurantId,
        },
        { isActive },
      );

      return true;
    } catch (error) {
      console.error(error);

      return rejectWithValue(storableError(error));
    }
  },
);

export const PartnerSettingsThunks = {
  loadData,
  requestCoverUpload: uploadCover,
  requestAvatarUpload: uploadAvatar,
  updatePartnerRestaurantListing,
  toggleRestaurantActiveStatus,
};

// ================ Slice ================ //
const PartnerSettingsSlice = createSlice({
  name: 'PartnerSettings',
  initialState,
  reducers: {
    removeAvatar: (state: any, { payload }) => {
      const id = payload;
      // Only mark the image removed if it hasn't been added to the
      // listing already
      const removedAvatarIds = state.uploadedAvatars[id]
        ? state.removedAvatarIds
        : state.removedAvatarIds.concat(id);

      // Always remove from the draft since it might be a new image to
      // an existing listing.
      const uploadedAvatars = omit(state.uploadedAvatars, id);
      const uploadedAvatarsOrder = state.uploadedAvatarsOrder.filter(
        (i: any) => i !== id,
      );

      return {
        ...state,
        uploadedAvatars,
        uploadedAvatarsOrder,
        removedAvatarIds,
        removedImageIds: state.removedImageIds.concat(id.uuid),
      };
    },
    removeCover: (state: any, { payload }) => {
      const id = payload;
      // Only mark the image removed if it hasn't been added to the
      // listing already

      const removedCoverIds = state.uploadedCovers[id]
        ? state.removedCoverIds
        : state.removedCoverIds.concat(id);

      // Always remove from the draft since it might be a new image to
      // an existing listing.
      const uploadedCovers = omit(state.uploadedCovers, id);
      const uploadedCoversOrder = state.uploadedCoversOrder.filter(
        (i: any) => i !== id,
      );

      return {
        ...state,
        uploadedCovers,
        uploadedCoversOrder,
        removedCoverIds,
        removedImageIds: state.removedImageIds.concat(id.uuid),
      };
    },
  },
  extraReducers: (builder) => {
    builder
      /* =============== loadData =============== */
      .addCase(loadData.pending, (state) => {
        state.fetchDataError = null;
        state.fetchDataInProgress = true;
      })
      .addCase(loadData.fulfilled, (state, { payload }) => {
        state.fetchDataInProgress = false;
        state.restaurantListing = payload?.restaurantListing;
        state.inProgressTransactions = payload?.inProgressTransactions;
      })
      .addCase(loadData.rejected, (state, { payload }) => {
        state.fetchDataInProgress = false;
        state.fetchDataError = payload;
      })
      .addCase(uploadAvatar.pending, (state, action) => {
        const { id } = action.meta.arg;

        const uploadedAvatars = {
          ...state.uploadedAvatars,
          [id]: { ...action.meta.arg },
        };

        return {
          ...state,
          uploadedAvatars,
          uploadedAvatarsOrder: state.uploadedAvatarsOrder.concat([id]),
          uploadAvatarError: null,
          uploadingAvatars: true,
        };
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        const { id, ...rest } = action.payload;
        const uploadedAvatars = {
          ...state.uploadedAvatars,
          [id]: { id, ...rest },
        };

        return { ...state, uploadedAvatars, uploadingAvatars: false };
      })
      .addCase(uploadAvatar.rejected, (state, action: any) => {
        const { id, error } = action.payload;
        const uploadedAvatarsOrder = state.uploadedAvatarsOrder.filter(
          (i: any) => i !== id,
        );
        const uploadedAvatars = omit(state.uploadedAvatars, id);

        return {
          ...state,
          uploadedAvatarsOrder,
          uploadedAvatars,
          uploadAvatarError: error,
          uploadingAvatars: false,
        };
      })
      .addCase(uploadCover.pending, (state, action) => {
        // payload.params: { id: 'tempId', file }
        const { id } = action.meta.arg;

        const uploadedCovers = {
          ...state.uploadedCovers,
          [id]: { ...action.meta.arg },
        };

        return {
          ...state,
          uploadedCovers,
          uploadedCoversOrder: state.uploadedCoversOrder.concat([id]),
          uploadCoverError: null,
          uploadingCovers: true,
        };
      })
      .addCase(uploadCover.fulfilled, (state, action) => {
        // payload.params: { id: 'tempId', imageId: 'some-real-id', attributes, type }
        const { id, ...rest } = action.payload;
        const uploadedCovers = {
          ...state.uploadedCovers,
          [id]: { id, ...rest },
        };

        return { ...state, uploadedCovers, uploadingCovers: false };
      })
      .addCase(uploadCover.rejected, (state, action: any) => {
        const { id, error } = action.payload;
        const uploadedCoversOrder = state.uploadedCoversOrder.filter(
          (i: any) => i !== id,
        );
        const uploadedCovers = omit(state.uploadedCovers, id);

        return {
          ...state,
          uploadedCoversOrder,
          uploadedCovers,
          uploadCoverError: error,
          uploadingCovers: false,
        };
      })
      /* =============== updatePartnerRestaurantListing =============== */
      .addCase(updatePartnerRestaurantListing.pending, (state) => {
        state.updateRestaurantInprogress = true;
      })
      .addCase(
        updatePartnerRestaurantListing.fulfilled,
        (state, { payload }) => {
          state.updateRestaurantInprogress = false;
          state.restaurantListing = payload;
        },
      )
      .addCase(updatePartnerRestaurantListing.rejected, (state) => {
        state.updateRestaurantInprogress = false;
      })
      /* =============== toggleRestaurantActiveStatus =============== */
      .addCase(toggleRestaurantActiveStatus.pending, (state) => {
        state.toggleAppStatusInProgress = true;
        state.toggleAppStatusError = null;
      })
      .addCase(toggleRestaurantActiveStatus.fulfilled, (state) => {
        state.toggleAppStatusInProgress = false;
      })
      .addCase(toggleRestaurantActiveStatus.rejected, (state, { payload }) => {
        state.toggleAppStatusInProgress = false;
        state.toggleAppStatusError = payload;
      });
  },
});

// ================ Actions ================ //
export const PartnerSettingsActions = PartnerSettingsSlice.actions;
export default PartnerSettingsSlice.reducer;

// ================ Selectors ================ //
