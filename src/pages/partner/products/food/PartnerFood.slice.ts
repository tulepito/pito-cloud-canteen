/* eslint-disable @typescript-eslint/no-shadow */
import { toast } from 'react-toastify';
import { createSlice } from '@reduxjs/toolkit';
import omit from 'lodash/omit';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

import { partnerFoodApi } from '@apis/foodApi';
import {
  createPartnerFoodApi,
  fetchFoodDeletableApi,
  fetchFoodEditableApi,
  fetchPartnerFoodApi,
  queryPartnerFoodsApi,
  reApprovalFoodApi,
  removePartnerFoodApi,
  removePartnerMultipleFoodApi,
  sendSlackNotificationToAdminApi,
  toggleFoodEnableApi,
  updatePartnerFoodApi,
  updatePartnerMenuApi,
} from '@apis/partnerApi';
import { getPartnerMenuQuery } from '@helpers/listingSearchQuery';
import { getImportDataFromCsv } from '@pages/admin/partner/[restaurantId]/settings/food/utils';
import { createAsyncThunk } from '@redux/redux.helper';
import { bottomRightToastOptions } from '@src/utils/toastify';
import { CurrentUser, denormalisedResponseEntities } from '@utils/data';
import { EFoodApprovalState, EImageVariants, EListingType } from '@utils/enums';
import { storableAxiosError, storableError } from '@utils/errors';
import type {
  TImage,
  TIntegrationListing,
  TKeyValue,
  TListing,
  TObject,
  TPagination,
} from '@utils/types';

export const MANAGE_FOOD_PAGE_SIZE = 12;

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
  createPartnerFoodFromCsvError: any;

  menuPickedFoods: TIntegrationListing[];
  queryMenuPickedFoodsInProgress: boolean;
  queryMenuPickedFoodsError: any;

  nutritions: TKeyValue[];
  categories: TKeyValue[];
  packaging: TKeyValue[];
  fetchAttributesInProgress: boolean;
  fetchAttributesError: any;

  acceptedFoods: TListing[];
  pendingFoods: TListing[];
  declinedFoods: TListing[];
  draftFoods: TListing[];
  totalAcceptedFoods: number;
  totalPendingFoods: number;
  totalDeclinedFoods: number;
  totalDraftFoods: number;
  fetchApprovalFoodsInProgress: boolean;
  fetchApprovalFoodsError: any;

  editableFoodMap: {
    [foodId: string]: boolean;
  };
  fetchEditableFoodInProgress: boolean;
  fetchEditableFoodError: any;

  deletableFoodMap: {
    [foodId: string]: boolean;
  };
  fetchDeletableFoodInProgress: boolean;
  fetchDeletableFoodError: any;

  menus: TListing[];
  fetchMenusInProgress: boolean;
  fetchMenusError: any;

  updatePartnerMenuInProgress: boolean;
  updatePartnerMenuError: any;

  reApprovalFoodInProgress: boolean;
  reApprovalFoodError: any;
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
  createPartnerFoodFromCsvError: null,

  // query food for menu picked food
  menuPickedFoods: [],
  queryMenuPickedFoodsInProgress: false,
  queryMenuPickedFoodsError: null,

  nutritions: [],
  categories: [],
  packaging: [],
  fetchAttributesInProgress: false,
  fetchAttributesError: null,

  acceptedFoods: [],
  pendingFoods: [],
  declinedFoods: [],
  draftFoods: [],
  totalAcceptedFoods: 0,
  totalPendingFoods: 0,
  totalDeclinedFoods: 0,
  totalDraftFoods: 0,
  fetchApprovalFoodsInProgress: false,
  fetchApprovalFoodsError: null,

  editableFoodMap: {},
  fetchEditableFoodInProgress: false,
  fetchEditableFoodError: null,

  deletableFoodMap: {},
  fetchDeletableFoodInProgress: false,
  fetchDeletableFoodError: null,

  menus: [],
  fetchMenusInProgress: false,
  fetchMenusError: null,

  updatePartnerMenuInProgress: false,
  updatePartnerMenuError: null,

  reApprovalFoodInProgress: false,
  reApprovalFoodError: null,
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
const FETCH_APPROVAL_FOODS = 'app/ManageFoodsPage/FETCH_APPROVAL_FOODS';
const FETCH_EDITABLE_FOOD = 'app/ManageFoodsPage/FETCH_EDITABLE_FOOD';
const FETCH_DELETABLE_FOOD = 'app/ManageFoodsPage/FETCH_DELETABLE_FOOD';
const FETCH_DRAFT_FOODS = 'app/ManageFoodsPage/FETCH_DRAFT_FOODS';

const FETCH_ACTIVE_MENUS = 'app/ManageFoodsPage/FETCH_ACTIVE_MENUS';
const UPDATE_PARTNER_MENU = 'app/ManageFoodsPage/UPDATE_PARTNER_MENU';
const SEND_SLACK_NOTIFICATION = 'app/ManageFoodsPage/SEND_SLACK_NOTIFICATION';
const TOGGLE_FOOD_ENABLED = 'app/ManageFoodsPage/TOGGLE_FOOD_ENABLED';
const RE_APPROVAL_FOOD = 'app/ManageFoodsPage/RE_APPROVAL_FOOD';

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
  async (payload: any) => {
    const { data: response } = await queryPartnerFoodsApi(payload);
    const { foodList, managePartnerFoodPagination } = response;

    return { foods: foodList, managePartnerFoodPagination };
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
      const { data: food } = await createPartnerFoodApi({
        dataParams: payload,
        queryParams: {},
      });

      return food;
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
      const { data } = await partnerFoodApi.createFood({
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
  async (payload: TObject, { rejectWithValue }) => {
    try {
      const { shouldShowToast = true, ...rest } = payload;
      const dataParams = {
        ...rest,
      };
      const queryParams = {
        include: ['images'],
        'fields.image': [`variants.${EImageVariants.squareSmall2x}`],
        expand: true,
      };
      const { data: food } = await updatePartnerFoodApi(dataParams.id, {
        dataParams,
        queryParams,
      });

      if (shouldShowToast) {
        toast.success('Cập nhật món ăn thành công', bottomRightToastOptions);
      }

      return food;
    } catch (error) {
      console.error(`${UPDATE_PARTNER_FOOD_LISTING} error: `, error);
      const { shouldShowToast = true } = payload;
      if (shouldShowToast) {
        toast.error('Cập nhật món ăn thất bại', bottomRightToastOptions);
      }

      return rejectWithValue(storableError(error));
    }
  },
);

const createPartnerFoodFromCsv = createAsyncThunk(
  CREATE_FOOD_FROM_FILE,
  async (
    {
      file,
      googleSheetUrl,
      restaurantId,
    }: {
      file?: File;
      googleSheetUrl?: string;
      restaurantId?: string;
    },
    { getState },
  ) => {
    const { currentUser } = getState().user;
    const currentUserGetter = CurrentUser(currentUser!);
    const { restaurantListingId } = currentUserGetter.getMetadata();
    if (file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const data = e?.target?.result;

          const workbook = XLSX.read(data, { type: 'array' });

          if (!workbook.SheetNames.includes('Template')) {
            reject(new Error('File không đúng định dạng'));
          }
          // organize xlsx data into desired format
          workbook.SheetNames.forEach(async (sheet) => {
            if (sheet === 'Template') {
              try {
                const worksheet = workbook.Sheets[sheet];

                const data = XLSX.utils.sheet_to_json(worksheet);

                const isProduction =
                  process.env.NEXT_PUBLIC_ENV === 'production';
                const dataLengthToImport = isProduction ? data.length : 3;
                const response = await Promise.all(
                  data
                    .slice(0, dataLengthToImport)
                    .map(async (foodData: any) => {
                      const dataParams = getImportDataFromCsv({
                        ...foodData,
                        restaurantId: restaurantId || restaurantListingId,
                      });

                      const queryParams = {
                        expand: true,
                      };
                      const { data } = await partnerFoodApi.createFood({
                        dataParams,
                        queryParams,
                      });

                      const [food] = denormalisedResponseEntities(data);

                      return food;
                    }),
                );
                resolve(response as any);
              } catch (error) {
                console.error('error', error);
                reject(error);
              }
            }
          });
        };
        reader.readAsArrayBuffer(file);
      });
    }

    return new Promise((resolve, reject) => {
      Papa.parse(googleSheetUrl, {
        download: true,
        header: true,
        skipEmptyLines: true,
        async complete({ data = [] }: { data: any[] }) {
          const isProduction = process.env.NEXT_PUBLIC_ENV === 'production';
          const dataLengthToImport = isProduction ? data.length : 3;
          const packagingOptions = getState().SystemAttributes.packaging;
          const response = await Promise.all(
            data.slice(0, dataLengthToImport).map(async (foodData: any) => {
              const dataParams = getImportDataFromCsv(
                {
                  ...foodData,
                  restaurantId: restaurantId || restaurantListingId,
                },
                packagingOptions,
              );

              const queryParams = {
                expand: true,
              };

              const { data } = await partnerFoodApi.createFood({
                dataParams,
                queryParams,
              });

              const [food] = denormalisedResponseEntities(data);

              return food;
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
  async (id: any, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data: food } = await fetchPartnerFoodApi(id);

      return fulfillWithValue(food);
    } catch (error) {
      console.error(`${SHOW_PARTNER_FOOD_LISTING} error: `, error);

      return rejectWithValue(storableError(error));
    }
  },
);

const removePartnerFood = createAsyncThunk(
  REMOVE_PARTNER_FOOD_LISTING,
  async (payload: TObject, { rejectWithValue }) => {
    try {
      const { id = '', ids = [] } = payload;
      const isDeletingListIds = ids.length > 0;
      const { data } = isDeletingListIds
        ? await removePartnerMultipleFoodApi({
            dataParams: {
              ids,
            },
            queryParams: {},
          })
        : await removePartnerFoodApi(id);
      toast.success('Xóa món ăn thành công', bottomRightToastOptions);

      return data;
    } catch (error) {
      console.error(`${REMOVE_PARTNER_FOOD_LISTING} error: `, error);
      toast.error('Xóa món ăn thất bại', bottomRightToastOptions);

      return rejectWithValue(storableAxiosError(error));
    }
  },
);

const showDuplicateFood = createAsyncThunk(
  SHOW_DUPLICATE_FOOD,
  async (id: any, { rejectWithValue }) => {
    try {
      const { data: food } = await fetchPartnerFoodApi(id);

      return food;
    } catch (error) {
      return rejectWithValue(storableAxiosError(error));
    }
  },
);

const fetchApprovalFoods = createAsyncThunk(
  FETCH_APPROVAL_FOODS,
  async (status: EFoodApprovalState) => {
    const { data: response } = await queryPartnerFoodsApi({
      adminApproval: status,
      isDraft: false,
      perPage: 100,
    });
    const { foodList, managePartnerFoodPagination: totalItems } = response;

    return {
      ...(status === EFoodApprovalState.ACCEPTED && {
        acceptedFoods: foodList,
        totalAcceptedFoods: totalItems.totalItems,
      }),
      ...(status === EFoodApprovalState.PENDING && {
        pendingFoods: foodList,
        totalPendingFoods: totalItems.totalItems,
      }),
      ...(status === EFoodApprovalState.DECLINED && {
        declinedFoods: foodList,
        totalDeclinedFoods: totalItems.totalItems,
      }),
    };
  },
);

const fetchEditableFood = createAsyncThunk(
  FETCH_EDITABLE_FOOD,
  async (id: string) => {
    const {
      data: { isEditable },
    } = await fetchFoodEditableApi(id);

    return {
      foodId: id,
      isEditable,
    };
  },
);

const fetchDeletableFood = createAsyncThunk(
  FETCH_DELETABLE_FOOD,
  async (id: string) => {
    const {
      data: { isDeletable },
    } = await fetchFoodDeletableApi(id);

    return {
      foodId: id,
      isDeletable,
    };
  },
);

const fetchActiveMenus = createAsyncThunk(
  FETCH_ACTIVE_MENUS,
  async (payload: any, { extra: sdk, getState }) => {
    const { keywords, startDate, endDate } = payload;
    const { currentUser } = getState().user;
    const currentUserGetter = CurrentUser(currentUser!);
    const { restaurantListingId } = currentUserGetter.getMetadata();
    const partnerMenuQuery = getPartnerMenuQuery(restaurantListingId, {
      keywords,
      startDate,
      endDate,
    });
    const response = await sdk.listings.query(partnerMenuQuery);

    return denormalisedResponseEntities(response);
  },
);

const updatePartnerMenu = createAsyncThunk(
  UPDATE_PARTNER_MENU,
  async (payload: any, { getState }) => {
    const { currentUser } = getState().user;
    const { id, dataParams } = payload;
    const queryParams = {
      expand: true,
    };
    const { data } = await updatePartnerMenuApi(
      {
        menuId: id,
        partnerId: CurrentUser(currentUser!).getMetadata().restaurantListingId,
      },
      {
        dataParams,
        queryParams,
      },
    );

    toast.success('Cập nhật menu thành công', bottomRightToastOptions);

    return denormalisedResponseEntities(data)[0];
  },
);

const fetchDraftFood = createAsyncThunk(FETCH_DRAFT_FOODS, async () => {
  const { data: response } = await queryPartnerFoodsApi({
    isDraft: true,
    perPage: 100,
  });
  const { foodList, managePartnerFoodPagination } = response;

  return {
    draftFoods: foodList,
    totalDraftFoods: managePartnerFoodPagination.totalItems,
  };
});

const sendSlackNotification = createAsyncThunk(
  SEND_SLACK_NOTIFICATION,
  async (payload: any) => {
    const { foodId } = payload;
    await sendSlackNotificationToAdminApi(foodId, payload);
  },
);

const toggleFoodEnabled = createAsyncThunk(
  TOGGLE_FOOD_ENABLED,
  async (payload: any, { rejectWithValue }) => {
    try {
      const { foodId, action } = payload;
      const { data: food } = await toggleFoodEnableApi(foodId, {
        dataParams: { action },
        queryParams: {},
      });

      return food;
    } catch (error) {
      console.error(`${TOGGLE_FOOD_ENABLED} error: `, error);

      return rejectWithValue(storableError(error));
    }
  },
);

const reApprovalFood = createAsyncThunk(
  RE_APPROVAL_FOOD,
  async (payload: any, { rejectWithValue }) => {
    try {
      const { foodId } = payload;
      await reApprovalFoodApi(foodId);

      return foodId;
    } catch (error) {
      console.error(`${RE_APPROVAL_FOOD} error: `, error);

      return rejectWithValue(storableError(error));
    }
  },
);

export const partnerFoodSliceThunks = {
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
  fetchApprovalFoods,
  fetchEditableFood,
  fetchDeletableFood,
  fetchActiveMenus,
  updatePartnerMenu,
  fetchDraftFood,
  sendSlackNotification,
  toggleFoodEnabled,
  reApprovalFood,
};

// ================ Slice ================ //
const partnerFoodSlice = createSlice({
  name: 'partnerFood',
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
      .addCase(updatePartnerFoodListing.fulfilled, (state, { payload }) => ({
        ...state,
        currentFoodListing: payload,
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
      .addCase(createPartnerFoodFromCsv.rejected, (state, { error }) => ({
        ...state,
        createPartnerFoodFromCsvInProgress: false,
        createPartnerFoodFromCsvError: error,
      }))

      .addCase(fetchApprovalFoods.pending, (state) => ({
        ...state,
        fetchApprovalFoodsInProgress: true,
        fetchApprovalFoodsError: null,
      }))
      .addCase(fetchApprovalFoods.fulfilled, (state, { payload }) => ({
        ...state,
        fetchApprovalFoodsInProgress: false,
        ...payload,
      }))
      .addCase(fetchApprovalFoods.rejected, (state, { error }) => ({
        ...state,
        fetchApprovalFoodsInProgress: false,
        fetchApprovalFoodsError: error.message,
      }))

      .addCase(fetchEditableFood.pending, (state) => ({
        ...state,
        fetchEditableFoodInProgress: true,
        fetchEditableFoodError: null,
      }))
      .addCase(fetchEditableFood.fulfilled, (state, { payload }) => ({
        ...state,
        fetchEditableFoodInProgress: false,
        editableFoodMap: {
          ...state.editableFoodMap,
          [payload.foodId]: payload.isEditable,
        },
      }))
      .addCase(fetchEditableFood.rejected, (state, { error }) => ({
        ...state,
        fetchEditableFoodInProgress: false,
        fetchEditableFoodError: error.message,
      }))

      .addCase(fetchDeletableFood.pending, (state) => ({
        ...state,
        fetchDeletableFoodInProgress: true,
        fetchDeletableFoodError: null,
      }))
      .addCase(fetchDeletableFood.fulfilled, (state, { payload }) => ({
        ...state,
        fetchDeletableFoodInProgress: false,
        deletableFoodMap: {
          ...state.deletableFoodMap,
          [payload.foodId]: payload.isDeletable,
        },
      }))
      .addCase(fetchDeletableFood.rejected, (state, { error }) => ({
        ...state,
        fetchDeletableFoodInProgress: false,
        fetchDeletableFoodError: error.message,
      }))

      .addCase(fetchActiveMenus.pending, (state) => ({
        ...state,
        fetchMenusInProgress: true,
        fetchMenusError: null,
      }))
      .addCase(fetchActiveMenus.fulfilled, (state, { payload }) => ({
        ...state,
        fetchMenusInProgress: false,
        menus: payload,
      }))
      .addCase(fetchActiveMenus.rejected, (state, { error }) => ({
        ...state,
        fetchMenusInProgress: false,
        fetchMenusError: error.message,
      }))

      .addCase(updatePartnerMenu.pending, (state) => ({
        ...state,
        updatePartnerMenuInProgress: true,
        updatePartnerMenuError: null,
      }))
      .addCase(updatePartnerMenu.fulfilled, (state, { payload }) => ({
        ...state,
        menus: state.menus.map((menu: any) =>
          menu.id.uuid === payload.id.uuid ? payload : menu,
        ),
        updatePartnerMenuInProgress: false,
      }))
      .addCase(updatePartnerMenu.rejected, (state, { error }) => ({
        ...state,
        updatePartnerMenuInProgress: false,
        updatePartnerMenuError: error.message,
      }))

      .addCase(fetchDraftFood.pending, (state) => ({
        ...state,
        fetchApprovalFoodsInProgress: true,
        fetchApprovalFoodsError: null,
      }))
      .addCase(fetchDraftFood.fulfilled, (state, { payload }) => ({
        ...state,
        fetchApprovalFoodsInProgress: false,
        ...payload,
      }))
      .addCase(fetchDraftFood.rejected, (state, { error }) => ({
        ...state,
        fetchApprovalFoodsInProgress: false,
        fetchApprovalFoodsError: error.message,
      }))

      .addCase(toggleFoodEnabled.pending, (state) => ({
        ...state,
        updateFoodInProgress: true,
        updateFoodError: null,
      }))
      .addCase(toggleFoodEnabled.fulfilled, (state, { payload }) => ({
        ...state,
        updateFoodInProgress: false,
        foods: state.foods.map((food: any) =>
          food.id.uuid === payload.id.uuid
            ? {
                ...food,
                attributes: {
                  ...food.attributes,
                  enabled: payload.attributes.enabled,
                },
              }
            : food,
        ),
      }))
      .addCase(toggleFoodEnabled.rejected, (state, { error }) => ({
        ...state,
        updateFoodInProgress: false,
        updateFoodError: error.message,
      }))

      .addCase(reApprovalFood.pending, (state) => ({
        ...state,
        reApprovalFoodInProgress: true,
        reApprovalFoodError: null,
      }))
      .addCase(reApprovalFood.fulfilled, (state, { payload }) => ({
        ...state,
        reApprovalFoodInProgress: false,
        foods: state.foods.filter((food: any) => food.id.uuid !== payload),
      }))
      .addCase(reApprovalFood.rejected, (state, { error }) => ({
        ...state,
        reApprovalFoodInProgress: false,
        reApprovalFoodError: error.message,
      }));
  },
});

// ================ Actions ================ //
export const partnerFoodSliceActions = partnerFoodSlice.actions;
export default partnerFoodSlice.reducer;

// ================ Selectors ================ //
