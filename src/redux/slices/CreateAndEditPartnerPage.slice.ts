/* eslint-disable @typescript-eslint/no-use-before-define */
import { createAsyncThunk } from '@redux/redux.helper';
import { createSlice } from '@reduxjs/toolkit';
import {
  createDraftPartnerApi,
  deletePartnerApi,
  publishDraftPartnerApi,
  showRestaurantApi,
  updateRestaurantApi,
} from '@utils/api';
import { denormalisedResponseEntities } from '@utils/data';
import { EImageVariants } from '@utils/enums';
import { storableError } from '@utils/errors';
import type { TObject } from '@utils/types';
import omit from 'lodash/omit';

interface CreateAndEditPartnerState {
  createDraftPartnerInProgress: boolean;
  createDraftPartnerError: any;

  updatePartnerListingInProgress: boolean;
  updatePartnerListingError: any;

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

  showPartnerListingInProgress: boolean;
  showPartnerListingError: any;

  partnerListingRef: null;

  uploadedBusinessLicense: any;
  uploadedBusinessLicensesOrder: any[];
  removedBusinessLicenseIds: any[];
  uploadBusinessLicenseError: any;
  uploadingBusinessLicenses: boolean;

  uploadedFoodCertificate: any;
  uploadedFoodCertificatesOrder: any[];
  removedFoodCertificateIds: any[];
  uploadFoodCertificateError: any;
  uploadingFoodCertificates: boolean;

  uploadedPartyInsurance: any;
  uploadedPartyInsurancesOrder: any[];
  removedPartyInsuranceIds: any[];
  uploadPartyInsuranceError: any;
  uploadingPartyInsurances: boolean;

  publishDraftPartnerInProgress: boolean;
  publishDraftPartnerError: any;

  discardDraftPartnerInProgress: boolean;
  discardDraftPartnerError: any;
}

const REQUEST_AVATAR_UPLOAD =
  'app/CreateAndEditPartnerPage/REQUEST_AVATAR_UPLOAD';

const REQUEST_BUSINESS_LICENSE_UPLOAD =
  'app/CreateAndEditPartnerPage/REQUEST_BUSINESS_LICENSE_UPLOAD';

const REQUEST_FOOR_CERTIFICATE_UPLOAD =
  'app/CreateAndEditPartnerPage/REQUEST_FOOR_CERTIFICATE_UPLOAD';

const REQUEST_PARTY_INSURANCE_UPLOAD =
  'app/CreateAndEditPartnerPage/REQUEST_PARTY_INSURANCE_UPLOAD';

const REQUEST_COVER_UPLOAD =
  'app/CreateAndEditPartnerPage/REQUEST_COVER_UPLOAD';

const CREATE_DRAFT_PARTNER =
  'app/CreateAndEditPartnerPage/CREATE_DRAFT_PARTNER';

const SHOW_PARTNER_RESTAURANT_LISTING =
  'app/CreateAndEditPartnerPage/SHOW_PARTNER_RESTAURANT_LISTING';

const UPDATE_PARTNER_RESTAURANT_LISTING =
  'app/CreateAndEditPartnerPage/UPDATE_PARTNER_RESTAURANT_LISTING';

const PUBLISH_PARTNER = 'app/CreateAndEditPartnerPage/PUBLISH_PARTNER';
const DISCARD_DRAFT_PARTNER =
  'app/CreateAndEditPartnerPage/DISCARD_DRAFT_PARTNER';

const requestAvatarUpload = createAsyncThunk(
  REQUEST_AVATAR_UPLOAD,
  async (
    payload: TObject,
    { extra: sdk, fulfillWithValue, rejectWithValue },
  ) => {
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
      return fulfillWithValue({ ...img, id, imageId: img.id });
    } catch (error) {
      console.log('error', error);
      return rejectWithValue({ id, error: storableError(error) });
    }
  },
);

const requestCoverUpload = createAsyncThunk(
  REQUEST_COVER_UPLOAD,
  async (
    payload: TObject,
    { extra: sdk, fulfillWithValue, rejectWithValue },
  ) => {
    const { file, id } = payload || {};
    try {
      const response = await sdk.images.upload(
        { image: file },
        {
          expand: true,
          'fields.image': [
            `variants.${EImageVariants.scaledLarge}`,
            `variants.${EImageVariants.scaledMedium}`,
            `variants.${EImageVariants.scaledXLarge}`,
          ],
        },
      );
      const img = response.data.data;
      return fulfillWithValue({ ...img, id, imageId: img.id });
    } catch (error) {
      console.error(error);
      return rejectWithValue({ id, error: storableError(error) });
    }
  },
);

const requestBusinessLicenseUpload = createAsyncThunk(
  REQUEST_BUSINESS_LICENSE_UPLOAD,
  async (payload: any, { extra: sdk, fulfillWithValue, rejectWithValue }) => {
    const { file, id } = payload || {};
    try {
      const response = await sdk.images.upload(
        { image: file },
        {
          expand: true,
          'fields.image': [
            `variants.${EImageVariants.scaledLarge}`,
            `variants.${EImageVariants.scaledMedium}`,
            `variants.${EImageVariants.scaledXLarge}`,
          ],
        },
      );
      const img = response.data.data;
      return fulfillWithValue({ ...img, id, imageId: img.id });
    } catch (error) {
      console.log('error', error);
      return rejectWithValue({ id, error: storableError(error) });
    }
  },
);

const requestFoodCertificateUpload = createAsyncThunk(
  REQUEST_FOOR_CERTIFICATE_UPLOAD,
  async (payload: any, { extra: sdk, fulfillWithValue, rejectWithValue }) => {
    const { file, id } = payload || {};
    try {
      const response = await sdk.images.upload(
        { image: file },
        {
          expand: true,
          'fields.image': [
            `variants.${EImageVariants.scaledLarge}`,
            `variants.${EImageVariants.scaledMedium}`,
            `variants.${EImageVariants.scaledXLarge}`,
          ],
        },
      );
      const img = response.data.data;
      return fulfillWithValue({ ...img, id, imageId: img.id });
    } catch (error) {
      console.log('error', error);
      return rejectWithValue({ id, error: storableError(error) });
    }
  },
);

const requestPartyInsuranceUpload = createAsyncThunk(
  REQUEST_PARTY_INSURANCE_UPLOAD,
  async (payload: any, { extra: sdk, fulfillWithValue, rejectWithValue }) => {
    const { file, id } = payload || {};
    try {
      const response = await sdk.images.upload(
        { image: file },
        {
          expand: true,
          'fields.image': [
            `variants.${EImageVariants.scaledLarge}`,
            `variants.${EImageVariants.scaledMedium}`,
            `variants.${EImageVariants.scaledXLarge}`,
          ],
        },
      );
      const img = response.data.data;
      return fulfillWithValue({ ...img, id, imageId: img.id });
    } catch (error) {
      console.log('error', error);
      return rejectWithValue({ id, error: storableError(error) });
    }
  },
);

const publishDraftPartner = createAsyncThunk(
  PUBLISH_PARTNER,
  async (values: any, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await publishDraftPartnerApi(values);
      const { user, listing } = data;
      const [partner] = denormalisedResponseEntities(user);
      const [restaurant] = denormalisedResponseEntities(listing);
      return fulfillWithValue({ restaurant, partner });
    } catch (error) {
      console.log('error', error);
      return rejectWithValue(storableError(error));
    }
  },
);

const discardDraftPartner = createAsyncThunk(
  DISCARD_DRAFT_PARTNER,
  async (values: any, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await deletePartnerApi(values);
      const { user, listing } = data;
      const [partner] = denormalisedResponseEntities(user);
      const [restaurant] = denormalisedResponseEntities(listing);
      return fulfillWithValue({ restaurant, partner });
    } catch (error) {
      console.log('error', error);
      return rejectWithValue(storableError(error));
    }
  },
);

const createDraftPartner = createAsyncThunk(
  CREATE_DRAFT_PARTNER,
  async (values: TObject, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { userData, listingData } = values;
      const submitValues = {
        userParams: {
          userDataParams: userData,
          userQueryParams: {
            expand: true,
          },
        },
        listingParams: {
          listingDataParams: listingData,
          listingQueryParams: {
            expand: true,
          },
        },
      };
      const { data } = await createDraftPartnerApi(submitValues);
      const { listing, user } = data;
      return fulfillWithValue({ listing, user });
    } catch (error: any) {
      console.error(error);
      return rejectWithValue(storableError(error.response.data));
    }
  },
);

const showPartnerRestaurantListing = createAsyncThunk(
  SHOW_PARTNER_RESTAURANT_LISTING,
  async (id: any, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await showRestaurantApi({
        id,
        dataParams: {
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
        },
        queryParams: {
          expand: true,
        },
      });
      const [partner] = denormalisedResponseEntities(data);
      return fulfillWithValue(partner);
    } catch (error) {
      console.error(error);
      return rejectWithValue(storableError(error));
    }
  },
);

const updatePartnerRestaurantListing = createAsyncThunk(
  UPDATE_PARTNER_RESTAURANT_LISTING,
  async (values: any, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await updateRestaurantApi({
        dataParams: values,
        queryParams: {
          expand: true,
        },
      });
      return fulfillWithValue(data);
    } catch (error) {
      console.error(error);
      return rejectWithValue(storableError(error));
    }
  },
);

export const createAndEditPartnerPageThunks = {
  requestAvatarUpload,
  createDraftPartner,
  requestCoverUpload,
  showPartnerRestaurantListing,
  updatePartnerRestaurantListing,
  requestBusinessLicenseUpload,
  requestFoodCertificateUpload,
  requestPartyInsuranceUpload,
  publishDraftPartner,
  discardDraftPartner,
};

const initialState: CreateAndEditPartnerState = {
  // handle create partner
  createDraftPartnerInProgress: false,
  createDraftPartnerError: null,

  // update partner

  updatePartnerListingInProgress: false,
  updatePartnerListingError: null,

  // Show partner
  partnerListingRef: null,
  showPartnerListingInProgress: false,
  showPartnerListingError: null,

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

  uploadedBusinessLicense: {},
  uploadedBusinessLicensesOrder: [],
  removedBusinessLicenseIds: [],
  uploadBusinessLicenseError: null,
  uploadingBusinessLicenses: false,

  uploadedFoodCertificate: {},
  uploadedFoodCertificatesOrder: [],
  removedFoodCertificateIds: [],
  uploadFoodCertificateError: null,
  uploadingFoodCertificates: false,

  uploadedPartyInsurance: {},
  uploadedPartyInsurancesOrder: [],
  removedPartyInsuranceIds: [],
  uploadPartyInsuranceError: null,
  uploadingPartyInsurances: false,

  publishDraftPartnerInProgress: false,
  publishDraftPartnerError: null,

  discardDraftPartnerInProgress: false,
  discardDraftPartnerError: null,
};

export const createAndEditPartnerSlice = createSlice({
  name: 'CreateAndEditPartnerPage',
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
      };
    },
    removeBusinessLicense: (state: any, { payload }) => {
      const id = payload;
      // Only mark the image removed if it hasn't been added to the
      // listing already

      const removedBusinessLicenseIds = state.uploadedBusinessLicense[id]
        ? state.removedBusinessLicenseIds
        : state.removedBusinessLicenseIds.concat(id);

      // Always remove from the draft since it might be a new image to
      // an existing listing.
      const uploadedBusinessLicense = omit(state.uploadedBusinessLicense, id);
      const uploadedBusinessLicensesOrder =
        state.uploadedBusinessLicensesOrder.filter((i: any) => i !== id);

      return {
        ...state,
        uploadedBusinessLicense,
        uploadedBusinessLicensesOrder,
        removedBusinessLicenseIds,
      };
    },
    removeFoodCertificate: (state: any, { payload }) => {
      const id = payload;
      // Only mark the image removed if it hasn't been added to the
      // listing already

      const removedFoodCertificateIds = state.uploadedFoodCertificate[id]
        ? state.removedFoodCertificateIds
        : state.removedFoodCertificateIds.concat(id);

      // Always remove from the draft since it might be a new image to
      // an existing listing.
      const uploadedFoodCertificate = omit(state.uploadedFoodCertificate, id);
      const uploadedFoodCertificatesOrder =
        state.uploadedFoodCertificatesOrder.filter((i: any) => i !== id);

      return {
        ...state,
        uploadedFoodCertificate,
        uploadedFoodCertificatesOrder,
        removedFoodCertificateIds,
      };
    },
    removePartyInsurance: (state: any, { payload }) => {
      const id = payload;
      // Only mark the image removed if it hasn't been added to the
      // listing already

      const removedPartyInsuranceIds = state.uploadedPartyInsurance[id]
        ? state.removedPartyInsuranceIds
        : state.removedPartyInsuranceIds.concat(id);

      // Always remove from the draft since it might be a new image to
      // an existing listing.
      const uploadedPartyInsurance = omit(state.uploadedPartyInsurance, id);
      const uploadedPartyInsurancesOrder =
        state.uploadedPartyInsurancesOrder.filter((i: any) => i !== id);

      return {
        ...state,
        uploadedPartyInsurance,
        uploadedPartyInsurancesOrder,
        removedPartyInsuranceIds,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(requestAvatarUpload.pending, (state, action) => {
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
      .addCase(requestAvatarUpload.fulfilled, (state, action) => {
        const { id, ...rest } = action.payload;
        const uploadedAvatars = {
          ...state.uploadedAvatars,
          [id]: { id, ...rest },
        };
        return { ...state, uploadedAvatars, uploadingAvatar: false };
      })
      .addCase(requestAvatarUpload.rejected, (state, action: any) => {
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
      .addCase(requestCoverUpload.pending, (state, action) => {
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
      .addCase(requestCoverUpload.fulfilled, (state, action) => {
        // payload.params: { id: 'tempId', imageId: 'some-real-id', attributes, type }
        const { id, ...rest } = action.payload;
        const uploadedCovers = {
          ...state.uploadedCovers,
          [id]: { id, ...rest },
        };
        return { ...state, uploadedCovers, uploadingAvatar: false };
      })
      .addCase(requestCoverUpload.rejected, (state, action: any) => {
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
      })
      .addCase(createDraftPartner.pending, (state) => {
        return {
          ...state,
          createDraftPartnerInProgress: true,
          createDraftPartnerError: null,
        };
      })
      .addCase(createDraftPartner.fulfilled, (state, action) => {
        return {
          ...state,
          createDraftPartnerInProgress: false,
          partnerListingRef: action.payload.listing,
        };
      })
      .addCase(createDraftPartner.rejected, (state, action) => {
        return {
          ...state,
          createDraftPartnerInProgress: false,
          createDraftPartnerError: action.payload,
        };
      })
      .addCase(showPartnerRestaurantListing.pending, (state) => {
        return {
          ...state,
          showPartnerListingInProgress: true,
          showPartnerListingError: null,
        };
      })
      .addCase(showPartnerRestaurantListing.fulfilled, (state, action) => {
        return {
          ...state,
          showPartnerListingInProgress: false,
          partnerListingRef: action.payload,
        };
      })
      .addCase(showPartnerRestaurantListing.rejected, (state, action) => {
        return {
          ...state,
          showPartnerListingInProgress: false,
          showPartnerListingError: action.payload,
        };
      })
      .addCase(updatePartnerRestaurantListing.pending, (state) => {
        return {
          ...state,
          updatePartnerListingInProgress: true,
          updatePartnerListingError: null,
        };
      })
      .addCase(updatePartnerRestaurantListing.fulfilled, (state, action) => {
        return {
          ...state,
          updatePartnerListingInProgress: false,
          partnerListingRef: denormalisedResponseEntities(action.payload),
        };
      })
      .addCase(updatePartnerRestaurantListing.rejected, (state, action) => {
        return {
          ...state,
          updatePartnerListingInProgress: false,
          updatePartnerListingError: action.payload,
        };
      })
      .addCase(requestBusinessLicenseUpload.pending, (state, action) => {
        // payload.params: { id: 'tempId', file }
        const { id } = action.meta.arg;

        const uploadedBusinessLicense = {
          ...state.uploadedBusinessLicense,
          [id]: { ...action.meta.arg },
        };
        return {
          ...state,
          uploadedBusinessLicense,
          uploadedBusinessLicensesOrder:
            state.uploadedBusinessLicensesOrder.concat([id]),
          uploadBusinessLicenseError: null,
          uploadingBusinessLicenses: true,
        };
      })
      .addCase(requestBusinessLicenseUpload.fulfilled, (state, action) => {
        // payload.params: { id: 'tempId', imageId: 'some-real-id', attributes, type }
        const { id, ...rest } = action.payload;
        const uploadedBusinessLicense = {
          ...state.uploadedBusinessLicense,
          [id]: { id, ...rest },
        };
        return {
          ...state,
          uploadedBusinessLicense,
          uploadingBusinessLicenses: false,
        };
      })
      .addCase(requestBusinessLicenseUpload.rejected, (state, action: any) => {
        // eslint-disable-next-line no-console
        const { id, error } = action.payload;
        const uploadedBusinessLicensesOrder =
          state.uploadedBusinessLicensesOrder.filter((i: any) => i !== id);
        const uploadedBusinessLicense = omit(state.uploadedBusinessLicense, id);

        return {
          ...state,
          uploadedBusinessLicensesOrder,
          uploadedBusinessLicense,
          uploadBusinessLicenseError: error,
          uploadingBusinessLicenses: false,
        };
      })
      .addCase(requestFoodCertificateUpload.pending, (state, action) => {
        // payload.params: { id: 'tempId', file }
        const { id } = action.meta.arg;

        const uploadedFoodCertificate = {
          ...state.uploadedFoodCertificate,
          [id]: { ...action.meta.arg },
        };
        return {
          ...state,
          uploadedFoodCertificate,
          uploadedFoodCertificatesOrder:
            state.uploadedFoodCertificatesOrder.concat([id]),
          uploadFoodCertificateError: null,
          uploadingFoodCertificates: true,
        };
      })
      .addCase(requestFoodCertificateUpload.fulfilled, (state, action) => {
        // payload.params: { id: 'tempId', imageId: 'some-real-id', attributes, type }
        const { id, ...rest } = action.payload;
        const uploadedFoodCertificate = {
          ...state.uploadedFoodCertificate,
          [id]: { id, ...rest },
        };
        return {
          ...state,
          uploadedFoodCertificate,
          uploadingFoodCertificates: false,
        };
      })
      .addCase(requestFoodCertificateUpload.rejected, (state, action: any) => {
        // eslint-disable-next-line no-console
        const { id, error } = action.payload;
        const uploadedFoodCertificatesOrder =
          state.uploadedFoodCertificatesOrder.filter((i: any) => i !== id);
        const uploadedFoodCertificate = omit(state.uploadedFoodCertificate, id);
        return {
          ...state,
          uploadedFoodCertificatesOrder,
          uploadedFoodCertificate,
          uploadFoodCertificateError: error,
          uploadingFoodCertificates: false,
        };
      })
      .addCase(requestPartyInsuranceUpload.pending, (state, action) => {
        // payload.params: { id: 'tempId', file }
        const { id } = action.meta.arg;

        const uploadedPartyInsurance = {
          ...state.uploadedPartyInsurance,
          [id]: { ...action.meta.arg },
        };
        return {
          ...state,
          uploadedPartyInsurance,
          uploadedPartyInsurancesOrder:
            state.uploadedPartyInsurancesOrder.concat([id]),
          uploadPartyInsuranceError: null,
          uploadingPartyInsurances: true,
        };
      })
      .addCase(requestPartyInsuranceUpload.fulfilled, (state, action) => {
        // payload.params: { id: 'tempId', imageId: 'some-real-id', attributes, type }
        const { id, ...rest } = action.payload;
        const uploadedPartyInsurance = {
          ...state.uploadedPartyInsurance,
          [id]: { id, ...rest },
        };
        return {
          ...state,
          uploadedPartyInsurance,
          uploadingPartyInsurances: false,
        };
      })
      .addCase(requestPartyInsuranceUpload.rejected, (state, action: any) => {
        // eslint-disable-next-line no-console
        const { id, error } = action.payload;
        const uploadedPartyInsurancesOrder =
          state.uploadedPartyInsurancesOrder.filter((i: any) => i !== id);
        const uploadedPartyInsurance = omit(state.uploadedPartyInsurance, id);
        return {
          ...state,
          uploadedPartyInsurancesOrder,
          uploadedPartyInsurance,
          uploadPartyInsuranceError: error,
          uploadingPartyInsurances: false,
        };
      })
      .addCase(publishDraftPartner.pending, (state) => {
        return {
          ...state,
          publishDraftPartnerInProgress: true,
          publishDraftError: null,
        };
      })
      .addCase(publishDraftPartner.fulfilled, (state) => {
        return {
          ...state,
          publishDraftPartnerInProgress: false,
        };
      })
      .addCase(publishDraftPartner.rejected, (state, action) => {
        return {
          ...state,
          publishDraftPartnerInProgress: false,
          publishDraftPartnerError: action.payload,
        };
      })
      .addCase(discardDraftPartner.pending, (state) => {
        return {
          ...state,
          discardDraftPartnerInProgress: true,
          discardDraftPartnerError: null,
        };
      })
      .addCase(discardDraftPartner.fulfilled, (state) => {
        return {
          ...state,
          discardDraftPartnerInProgress: false,
        };
      })
      .addCase(discardDraftPartner.rejected, (state, action) => {
        return {
          ...state,
          discardDraftPartnerInProgress: false,
          discardDraftPartnerError: action.payload,
        };
      });
  },
});

export const {
  removeAvatar,
  removeCover,
  removeBusinessLicense,
  removeFoodCertificate,
  removePartyInsurance,
} = createAndEditPartnerSlice.actions;

export default createAndEditPartnerSlice.reducer;
