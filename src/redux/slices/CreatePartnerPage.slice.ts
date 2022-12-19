import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { createCompanyApi } from '@utils/api';
import { storableError } from '@utils/errors';
import omit from 'lodash/omit';

import { addMarketplaceEntities } from './marketplaceData.slice';

interface CreatePartnerState {
  createPartnerInProgress: boolean;
  createPartnerError: any;
  uploadedAvatars: object;
  uploadedAvatarsOrder: any[];
  removedAvatarIds: any[];
  uploadAvatarError: any;
  uploadingAvatars: boolean;
  uploadedCovers: object;
  uploadedCoversOrder: any[];
  removedCoverIds: any[];
  uploadCoverError: any;
  uploadingCovers: boolean;
}

const CREATE_PARTNER = 'app/CreatePartnerPage/CREATE_PARTNER';
const REQUEST_AVATAR_UPLOAD = 'app/CreatePartnerPage/REQUEST_AVATAR_UPLOAD';
const REQUEST_COVER_UPLOAD = 'app/CreatePartnerPage/REQUEST_COVER_UPLOAD';

const creatPartner = createAsyncThunk(
  CREATE_PARTNER,
  async (
    userData: any,
    { dispatch, fulfillWithValue, rejectWithValue }: ThunkAPI,
  ) => {
    try {
      const { data } = await createCompanyApi(userData);
      dispatch(addMarketplaceEntities(data));
      return fulfillWithValue(data);
    } catch (error: any) {
      console.log(error);
      return rejectWithValue(storableError(error.response.data));
    }
  },
);

const requestAvatarUpload = createAsyncThunk(
  REQUEST_AVATAR_UPLOAD,
  async (
    payload: any,
    { extra: sdk, fulfillWithValue, rejectWithValue }: ThunkAPI,
  ) => {
    const { file, id } = payload || {};
    try {
      const response = await sdk.images.upload(
        { image: file },
        {
          expand: true,
          'fields.image': [
            'variants.square-small',
            'variants.square-small2x',
            'variants.scaled-small',
            'variants.scaled-medium',
            'variants.scaled-large',
            'variants.scaled-xlarge',
          ],
        },
      );
      const img = response.data.data;
      return fulfillWithValue({ data: { ...img, id, imageId: img.id } });
    } catch (error) {
      console.log('error', error);
      return rejectWithValue({ id, error: storableError(error) });
    }
  },
);

const requestCoverUpload = createAsyncThunk(
  REQUEST_COVER_UPLOAD,
  async (
    payload: any,
    { extra: sdk, fulfillWithValue, rejectWithValue }: ThunkAPI,
  ) => {
    const { file, id } = payload;
    try {
      const response = await sdk.images.upload(
        { image: file },
        {
          expand: true,
          'fields.image': [
            'variants.square-small',
            'variants.square-small2x',
            'variants.scaled-small',
            'variants.scaled-medium',
            'variants.scaled-large',
            'variants.scaled-xlarge',
          ],
        },
      );
      const img = response.data.data;
      return fulfillWithValue({ data: { ...img, id, imageId: img.id } });
    } catch (error) {
      return rejectWithValue({ id, error: storableError(error) });
    }
  },
);

export const createPartnerPageThunks = {
  creatPartner,
  requestAvatarUpload,
  requestCoverUpload,
};

const initialState: CreatePartnerState = {
  createPartnerInProgress: false,
  createPartnerError: null,
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
};

export const createPartnerSlice = createSlice({
  name: 'CreatePartnerPage',
  initialState,
  reducers: {
    removeAvatar: (state: any, { payload }) => {
      const id = payload.imageId;

      // Only mark the image removed if it hasn't been added to the
      // listing already
      const removedImageIds = state.uploadedImages[id]
        ? state.removedImageIds
        : state.removedImageIds.concat(id);

      // Always remove from the draft since it might be a new image to
      // an existing listing.
      const uploadedImages = omit(state.uploadedImages, id);
      const uploadedImagesOrder = state.uploadedImagesOrder.filter(
        (i: any) => i !== id,
      );

      return {
        ...state,
        uploadedImages,
        uploadedImagesOrder,
        removedImageIds,
      };
    },
    removeCover: (state: any, { payload }) => {
      const id = payload.imageId;

      // Only mark the image removed if it hasn't been added to the
      // listing already
      const removedImageIds = state.uploadedImages[id]
        ? state.removedImageIds
        : state.removedImageIds.concat(id);

      // Always remove from the draft since it might be a new image to
      // an existing listing.
      const uploadedImages = omit(state.uploadedImages, id);
      const uploadedImagesOrder = state.uploadedImagesOrder.filter(
        (i: any) => i !== id,
      );

      return {
        ...state,
        uploadedImages,
        uploadedImagesOrder,
        removedImageIds,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(creatPartner.pending, (state) => ({
        ...state,
        createPartnerInProgress: true,
        createPartnerError: null,
      }))
      .addCase(creatPartner.fulfilled, (state) => ({
        ...state,
        createPartnerInProgress: false,
      }))
      .addCase(creatPartner.rejected, (state, action) => ({
        ...state,
        createPartnerInProgress: false,
        createPartnerError: action.payload,
      }))
      .addCase(
        requestAvatarUpload.pending,
        (state: CreatePartnerState, action: any) => {
          const uploadedAvatars = {
            ...state.uploadedAvatars,
            [action.meta.id]: { ...action.meta },
          };
          return {
            ...state,
            uploadedAvatars,
            uploadedAvatarsOrder: state.uploadedAvatarsOrder.concat([
              action.meta.id,
            ]),
            uploadAvatarError: null,
            uploadingAvatars: true,
          };
        },
      )
      .addCase(
        requestAvatarUpload.fulfilled,
        (state: CreatePartnerState, action: any) => {
          // payload.params: { id: 'tempId', imageId: 'some-real-id', attributes, type }
          const { id, ...rest } = action.payload;
          const uploadedAvatars = {
            ...state.uploadedAvatars,
            [id]: { id, ...rest },
          };
          return { ...state, uploadedAvatars, uploadingAvatar: false };
        },
      )
      .addCase(
        requestAvatarUpload.rejected,
        (state: CreatePartnerState, action: any) => {
          console.log(action);
          const { id, error } = action.error;
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
        },
      )
      .addCase(
        requestCoverUpload.pending,
        (state: CreatePartnerState, action: any) => {
          // payload.params: { id: 'tempId', file }
          const uploadedCovers = {
            ...state.uploadedCovers,
            [action.payload.params.id]: { ...action.meta },
          };
          return {
            ...state,
            uploadedCovers,
            uploadedCoversOrder: state.uploadedCoversOrder.concat([
              action.meta.id,
            ]),
            uploadCoverError: null,
            uploadingCovers: true,
          };
        },
      )
      .addCase(
        requestCoverUpload.fulfilled,
        (state: CreatePartnerState, action: any) => {
          // payload.params: { id: 'tempId', imageId: 'some-real-id', attributes, type }
          const { id, ...rest } = action.payload;
          const uploadedCovers = {
            ...state.uploadedCovers,
            [id]: { id, ...rest },
          };
          return { ...state, uploadedCovers, uploadingAvatar: false };
        },
      )
      .addCase(
        requestCoverUpload.rejected,
        (state: CreatePartnerState, action: any) => {
          // eslint-disable-next-line no-console
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
        },
      );
  },
});

export const { removeAvatar, removeCover } = createPartnerSlice.actions;

export default createPartnerSlice.reducer;
