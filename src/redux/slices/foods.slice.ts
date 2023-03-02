/* eslint-disable @typescript-eslint/no-shadow */
import {
  createPartnerFoodApi,
  deletePartnerFoodApi,
  showPartnerFoodApi,
  updatePartnerFoodApi,
} from '@apis/foodApi';
import { getImportDataFromCsv } from '@pages/admin/partner/[restaurantId]/settings/food/utils';
import { createAsyncThunk } from '@redux/redux.helper';
import { createSlice } from '@reduxjs/toolkit';
import { denormalisedResponseEntities } from '@utils/data';
import { EImageVariants, EListingType } from '@utils/enums';
import { storableError } from '@utils/errors';
import type {
  TImage,
  TIntegrationListing,
  TListing,
  TPagination,
} from '@utils/types';
import omit from 'lodash/omit';
import Papa from 'papaparse';

export const MANAGE_FOOD_PAGE_SIZE = 10;

// ================ Initial states ================ //
type TFoodSliceState = {
  foods: any[];
  queryFoodsInProgress: boolean;
  queryFoodsError: any;
  managePartnerFoodPagination: TPagination | null;

  uploadedImages: any;
  uploadedImagesOrder: any[];
  removedImageIds: any[];
  uploadImageError: any;
  uploadingImages: boolean;

  createFoodInProgress: boolean;
  createFoodError: any;

  showFoodInProgress: boolean;
  showFoodError: any;

  currentFoodListing: TListing | null;

  updateFoodInProgress: boolean;
  updateFoodError: any;

  removeFoodInProgress: boolean;
  removeFoodError: any;

  createPartnerFoodFromCsvInProgress: boolean;
  creataPartnerFoodFromCsvError: any;

  menuPickedFoods: TIntegrationListing[];
  queryMenuPickedFoodsInProgress: boolean;
  queryMenuPickedFoodsError: any;
};

const initialState: TFoodSliceState = {
  foods: [],
  queryFoodsError: null,
  queryFoodsInProgress: false,
  managePartnerFoodPagination: null,

  // Upload food's images
  uploadedImages: null,
  uploadedImagesOrder: [],
  removedImageIds: [],
  uploadImageError: null,
  uploadingImages: false,

  // Create food listing
  createFoodInProgress: false,
  createFoodError: null,

  // show food listing
  showFoodInProgress: false,
  showFoodError: null,
  currentFoodListing: null,

  // update food listing
  updateFoodInProgress: false,
  updateFoodError: null,

  // remove food
  removeFoodInProgress: false,
  removeFoodError: null,

  createPartnerFoodFromCsvInProgress: false,
  creataPartnerFoodFromCsvError: null,

  // query food for menu picked food
  menuPickedFoods: [],
  queryMenuPickedFoodsInProgress: false,
  queryMenuPickedFoodsError: null,
};

// ================ Thunk types ================ //
const QUERY_PARTNER_FOODS = 'app/ManageFoodsPage/QUERY_PARTNER_FOODS';
const REQUEST_UPLOAD_IMAGE_FOOD =
  'app/ManageFoodsPage/REQUEST_UPLOAD_IMAGE_FOOD';

const CREATE_PARTNER_FOOD_LISTING =
  'app/ManageFoodsPage/CREATE_PARTNER_FOOD_LISTING';
const UPDATE_PARTNER_FOOD_LISTING =
  'app/ManageFoodsPage/UPDATE_PARTNER_FOOD_LISTING';

const SHOW_PARTNER_FOOD_LISTING =
  'app/ManageFoodsPage/SHOW_PARTNER_FOOD_LISTING';
const REMOVE_PARTNER_FOOD_LISTING =
  'app/ManageFoodsPage/REMOVE_PARTNER_FOOD_LISTING';

const SHOW_DUPLICATE_FOOD = 'app/ManageFoodsPage/SHOW_DUPLICATE_FOOD';
const DUPLICATE_FOOD = 'app/ManageFoodsPage/DUPLICATE_FOOD';

const CREATE_FOOD_FROM_FILE = 'app/ManageFoodsPage/CREATE_FOOD_FROM_FILE';

const QUERY_MENU_PICKED_FOODS = 'app/ManageFoodsPage/QUERY_MENU_PICKED_FOODS';

// ================ Async thunks ================ //

const queryMenuPickedFoods = createAsyncThunk(
  QUERY_MENU_PICKED_FOODS,
  async (payload: any, { extra: sdk }) => {
    const { restaurantId, ids } = payload;
    const response = await sdk.listings.query({
      ids,
      meta_listingType: EListingType.food,
      meta_restaurantId: restaurantId,
      meta_isDeleted: false,
    });

    const foods = denormalisedResponseEntities(response);
    return foods;
  },
  {
    serializeError: storableError,
  },
);

const queryPartnerFoods = createAsyncThunk(
  QUERY_PARTNER_FOODS,
  async (payload: any, { extra: sdk }) => {
    const { restaurantId, ...rest } = payload;
    const response = await sdk.listings.query({
      ...rest,
      meta_listingType: EListingType.food,
      meta_restaurantId: restaurantId,
      meta_isDeleted: false,
      perPage: MANAGE_FOOD_PAGE_SIZE,
      include: ['images'],
      'fields.image': [`variants.${EImageVariants.squareSmall2x}`],
    });
    const foods = denormalisedResponseEntities(response);
    return { foods, managePartnerFoodPagination: response.data.meta };
  },
  {
    serializeError: storableError,
  },
);

const requestUploadFoodImages = createAsyncThunk(
  REQUEST_UPLOAD_IMAGE_FOOD,
  async (
    { id, file }: { id: string; file: File },
    { extra: sdk, rejectWithValue },
  ) => {
    try {
      const response = await sdk.images.upload(
        { image: file },
        {
          expand: true,
          'fields.image': [`variants.${EImageVariants.squareSmall2x}`],
        },
      );
      const img = response.data.data;
      return { ...img, id, imageId: img.id };
    } catch (error) {
      console.error(`${REQUEST_UPLOAD_IMAGE_FOOD} error: `, error);
      return rejectWithValue({ error, id });
    }
  },
);

const createPartnerFoodListing = createAsyncThunk(
  CREATE_PARTNER_FOOD_LISTING,
  async (payload: any, { rejectWithValue }) => {
    try {
      const { data } = await createPartnerFoodApi({
        dataParams: payload,
        queryParams: {},
      });
      return denormalisedResponseEntities(data)[0];
    } catch (error) {
      console.error(`${CREATE_PARTNER_FOOD_LISTING} error: `, error);
      return rejectWithValue(storableError(error));
    }
  },
);

const duplicateFood = createAsyncThunk(
  DUPLICATE_FOOD,
  async (payload: any, { extra: sdk, rejectWithValue }) => {
    try {
      const { images = [], title } = payload || {};
      // parse url to file
      const imageAsFiles = await Promise.all(
        images
          .map(async (image: TImage) => {
            try {
              const response = await fetch(
                image.attributes.variants[EImageVariants.squareSmall2x].url,
              );
              const data = await response.blob();
              const metadata = {
                type: 'image/jpeg',
              };
              const file = new File(
                [data],
                `${`${title}_${new Date().getTime()}`}.jpg`,
                metadata,
              );
              return file;
            } catch (error) {
              console.error(error);
              return null;
            }
          })
          .filter((file: File) => !!file),
      );
      // upload image to Flex
      const uploadRes = await Promise.all(
        imageAsFiles.map(async (file) =>
          sdk.images.upload({
            image: file,
          }),
        ),
      );

      const newImages = uploadRes.map((res) => res.data.data.id);
      const { data } = await createPartnerFoodApi({
        dataParams: { ...payload, images: newImages },
        queryParams: {},
      });
      return denormalisedResponseEntities(data)[0];
    } catch (error) {
      console.error(`${CREATE_PARTNER_FOOD_LISTING} error: `, error);
      return rejectWithValue(storableError(error));
    }
  },
);

const updatePartnerFoodListing = createAsyncThunk(
  UPDATE_PARTNER_FOOD_LISTING,
  async (payload: any, { rejectWithValue }) => {
    try {
      const dataParams = {
        ...payload,
      };
      const queryParams = {
        include: ['images'],
        'fields.image': [`variants.${EImageVariants.squareSmall2x}`],
        expand: true,
      };
      const { data } = await updatePartnerFoodApi({ dataParams, queryParams });
      const [food] = denormalisedResponseEntities(data);
      return food;
    } catch (error) {
      console.error(`${UPDATE_PARTNER_FOOD_LISTING} error: `, error);
      return rejectWithValue(storableError(error));
    }
  },
);

const createPartnerFoodFromCsv = createAsyncThunk(
  CREATE_FOOD_FROM_FILE,
  async (
    { file, restaurantId }: { file: File; restaurantId: string },
    { extra: sdk },
  ) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        async complete({ data }: any) {
          const response = await Promise.all(
            data.map(async (l: any) => {
              const dataParams = getImportDataFromCsv({
                ...l,
                restaurantId,
              });
              console.log({ dataParams });
              // const queryParams = {
              //   expand: true,
              // };
              // const { data } = await createPartnerFoodApi({
              //   dataParams,
              //   queryParams,
              // });
              // return denormalisedResponseEntities(data)[0];
            }),
          );
          resolve(response as any);
        },
        error(err: any) {
          reject(err);
        },
      });
    });
  },
);

const showPartnerFoodListing = createAsyncThunk(
  SHOW_PARTNER_FOOD_LISTING,
  async (id: any) => {
    const { data } = await showPartnerFoodApi(id, {
      dataParams: {
        include: ['images'],
        'fields.image': [`variants.${EImageVariants.squareSmall2x}`],
      },
      queryParams: {
        expand: true,
      },
    });
    const [food] = denormalisedResponseEntities(data);
    return food;
  },
  {
    serializeError: storableError,
  },
);

const removePartnerFood = createAsyncThunk(
  REMOVE_PARTNER_FOOD_LISTING,
  async (payload: any, { rejectWithValue }) => {
    try {
      const { data } = await deletePartnerFoodApi({
        dataParams: {
          ...payload,
        },
        queryParams: {},
      });
      return data;
    } catch (error) {
      console.error(`${REMOVE_PARTNER_FOOD_LISTING} error: `, error);
      return rejectWithValue(storableError(error));
    }
  },
);

const showDuplicateFood = createAsyncThunk(
  SHOW_DUPLICATE_FOOD,
  async (id: any) => {
    try {
      const { data } = await showPartnerFoodApi(id, {
        dataParams: {
          include: ['images'],
          'fields.image': [`variants.${EImageVariants.squareSmall2x}`],
        },
        queryParams: {
          expand: true,
        },
      });

      const [food] = denormalisedResponseEntities(data);
      return food;
    } catch (error) {
      return storableError(error);
    }
  },
);

export const foodSliceThunks = {
  queryPartnerFoods,
  requestUploadFoodImages,
  createPartnerFoodListing,
  updatePartnerFoodListing,
  showPartnerFoodListing,
  removePartnerFood,
  showDuplicateFood,
  duplicateFood,
  createPartnerFoodFromCsv,
  queryMenuPickedFoods,
};

// ================ Slice ================ //
const foodSlice = createSlice({
  name: 'foodSlice',
  initialState,
  reducers: {
    removeImage: (state: any, { payload }) => {
      const id = payload;
      // Only mark the image removed if it hasn't been added to the
      // listing already
      const removedImageIds =
        id && state?.uploadedImages?.[id]
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
    setInitialStates: () => ({
      ...initialState,
    }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(queryPartnerFoods.pending, (state) => ({
        ...state,
        queryFoodsInProgress: true,
        queryFoodsError: null,
      }))
      .addCase(queryPartnerFoods.fulfilled, (state, { payload }) => ({
        ...state,
        queryFoodsInProgress: false,
        foods: payload.foods,
        managePartnerFoodPagination: payload.managePartnerFoodPagination,
      }))
      .addCase(queryPartnerFoods.rejected, (state, { payload }) => ({
        ...state,
        queryFoodsInProgress: false,
        queryFoodsError: payload,
      }))
      .addCase(requestUploadFoodImages.pending, (state, action) => {
        const { id } = action.meta.arg;

        const uploadedImages = {
          ...state.uploadedImages,
          [id]: { ...action.meta.arg },
        };
        return {
          ...state,
          uploadedImages,
          uploadedImagesOrder: state.uploadedImagesOrder.concat([id]),
          uploadImageError: null,
          uploadingImages: true,
        };
      })
      .addCase(requestUploadFoodImages.fulfilled, (state, action) => {
        const { id, ...rest } = action.payload;
        const uploadedImages = {
          ...state.uploadedImages,
          [id]: { id, ...rest },
        };
        return { ...state, uploadedImages, uploadingImages: false };
      })
      .addCase(requestUploadFoodImages.rejected, (state, action: any) => {
        const { id, error } = action.payload;
        const uploadedImagesOrder = state.uploadedImagesOrder.filter(
          (i: any) => i !== id,
        );
        const uploadedImages = omit(state.uploadedImages, id);
        return {
          ...state,
          uploadedImagesOrder,
          uploadedImages,
          uploadImageError: error,
          uploadingImages: false,
        };
      })
      .addCase(createPartnerFoodListing.pending, (state) => ({
        ...state,
        createFoodError: null,
        createFoodInProgress: true,
      }))
      .addCase(createPartnerFoodListing.fulfilled, (state) => ({
        ...state,
        createFoodInProgress: false,
      }))
      .addCase(createPartnerFoodListing.rejected, (state, { payload }) => ({
        ...state,
        createFoodInProgress: false,
        createFoodError: payload,
      }))
      .addCase(showPartnerFoodListing.pending, (state) => ({
        ...state,
        showFoodInProgress: true,
        showFoodError: null,
      }))
      .addCase(showPartnerFoodListing.fulfilled, (state, { payload }) => ({
        ...state,
        showFoodInProgress: false,
        currentFoodListing: payload,
      }))
      .addCase(showPartnerFoodListing.rejected, (state, { payload }) => ({
        ...state,
        showFoodInProgress: false,
        showFoodError: payload,
      }))
      .addCase(updatePartnerFoodListing.pending, (state) => ({
        ...state,
        updateFoodInProgress: true,
        updateFoodError: null,
      }))
      .addCase(updatePartnerFoodListing.fulfilled, (state) => ({
        ...state,
        updateFoodInProgress: false,
      }))
      .addCase(updatePartnerFoodListing.rejected, (state, { payload }) => ({
        ...state,
        updateFoodInProgress: false,
        updateFoodError: payload,
      }))
      .addCase(removePartnerFood.pending, (state, { meta }) => ({
        ...state,
        removeFoodInProgress: meta.arg.id || meta.arg.ids,
        removeFoodError: null,
      }))
      .addCase(removePartnerFood.fulfilled, (state) => ({
        ...state,
        removeFoodInProgress: false,
      }))
      .addCase(removePartnerFood.rejected, (state, { payload }) => ({
        ...state,
        removeFoodInProgress: false,
        removeFoodError: payload,
      }))
      .addCase(showDuplicateFood.pending, (state) => ({
        ...state,
        showFoodInProgress: true,
        showFoodError: null,
      }))
      .addCase(showDuplicateFood.fulfilled, (state, { payload }) => ({
        ...state,
        showFoodInProgress: false,
        currentFoodListing: payload,
      }))
      .addCase(showDuplicateFood.rejected, (state, { payload }) => ({
        ...state,
        showFoodInProgress: false,
        showFoodError: payload,
      }))
      .addCase(duplicateFood.pending, (state) => ({
        ...state,
        createFoodError: null,
        createFoodInProgress: true,
      }))
      .addCase(duplicateFood.fulfilled, (state) => ({
        ...state,
        createFoodInProgress: false,
      }))
      .addCase(duplicateFood.rejected, (state, { payload }) => ({
        ...state,
        createFoodInProgress: false,
        createFoodError: payload,
      }))
      .addCase(createPartnerFoodFromCsv.pending, (state) => ({
        ...state,
        createPartnerFoodFromCsvInProgress: true,
        createPartnerFoodFromCsvError: null,
      }))
      .addCase(
        createPartnerFoodFromCsv.fulfilled,
        (state, { payload = [] }) => ({
          ...state,
          createPartnerFoodFromCsvInProgress: false,
          createPartnerFoodFromCsvError: null,
          foods: [
            ...(payload as unknown as TIntegrationListing[]),
            ...state.foods,
          ],
        }),
      )
      .addCase(createPartnerFoodFromCsv.rejected, (state, { payload }) => ({
        ...state,
        createPartnerFoodFromCsvInProgress: false,
        createPartnerFoodFromCsvError: payload,
      }));
  },
});

// ================ Actions ================ //
export const foodSliceAction = foodSlice.actions;
export default foodSlice.reducer;

// ================ Selectors ================ //
