import { createSlice } from '@reduxjs/toolkit';
import uniqBy from 'lodash/uniqBy';

import {
  fetchParticipantFirebaseSubOrderApi,
  participantSubOrderGetDocumentApi,
} from '@apis/firebaseApi';
import { createAsyncThunk } from '@redux/redux.helper';
import type { ParticipantSubOrderDocument } from '@src/types';
import { denormalisedResponseEntities } from '@src/utils/data';
import { EImageVariants, ESubOrderTxStatus } from '@src/utils/enums';

const FIREBASE_LIMIT_RECORDS = 20;

// ================ Initial states ================ //
type TSubOrdersState = {
  subOrders: any[];
  deliveringSubOrders: any[];
  deliveredSubOrders: ParticipantSubOrderDocument[];
  fetchSubOrdersInProgress: boolean;
  fetchSubOrdersError: any;

  subOrderReview: any;
  fetchReviewInProgress: boolean;
  fetchReviewError: any;
  deliveringLastRecord: number | null;
  deliveredLastRecord: number | null;

  fetchSubOrderInProgress: boolean;
  fetchSubOrderError: any;
};
const initialState: TSubOrdersState = {
  subOrders: [],
  deliveringSubOrders: [],
  deliveredSubOrders: [],
  fetchSubOrdersInProgress: false,
  fetchSubOrdersError: null,
  subOrderReview: [],
  fetchReviewInProgress: false,
  fetchReviewError: null,
  deliveringLastRecord: null,
  deliveredLastRecord: null,
  fetchSubOrderInProgress: false,
  fetchSubOrderError: null,
};

// ================ Thunk types ================ //
const FETCH_SUB_ORDERS_FROM_FIREBASE =
  'app/SubOrders/FETCH_SUB_ORDERS_FROM_FIREBASE';

const FETCH_REVIEW_FROM_SUB_ORDER = 'app/SubOrders/FETCH_REVIEW_FROM_SUB_ORDER';
const FETCH_SUB_ORDER_FROM_FIREBASE =
  'app/SubOrders/FETCH_SUB_ORDER_FROM_FIREBASE';
// ================ Async thunks ================ //

const fetchSubOrdersFromFirebase = createAsyncThunk(
  FETCH_SUB_ORDERS_FROM_FIREBASE,
  async (
    payload: {
      participantId: string;
      txStatus: string | string[];
      extraQueryParams?: Record<string, any>;
      lastRecord?: number | null;
    },
    { getState },
  ) => {
    if (!payload.participantId) return [] as any;

    const { deliveringLastRecord, deliveredLastRecord } =
      getState().ParticipantSubOrderList;
    const { participantId, txStatus } = payload;

    const { data: response } = await participantSubOrderGetDocumentApi({
      participantId,
      txStatus,
      limitRecords: FIREBASE_LIMIT_RECORDS,
      lastRecord:
        payload.lastRecord === null
          ? payload.lastRecord
          : Array.isArray(txStatus)
          ? deliveringLastRecord
          : deliveredLastRecord,
      extraQueryParams: payload.extraQueryParams,
    });

    return Array.isArray(txStatus)
      ? {
          deliveringSubOrders: response,
        }
      : {
          deliveredSubOrders: response,
        };
  },
);

const fetchReviewFromSubOrder = createAsyncThunk(
  FETCH_REVIEW_FROM_SUB_ORDER,
  async (reviewId: string, { extra: sdk }) => {
    const review = denormalisedResponseEntities(
      await sdk.listings.show({
        id: reviewId,
        include: ['images'],
        'fields.image': [
          `variants.${EImageVariants.landscapeCrop}`,
          `variants.${EImageVariants.landscapeCrop2x}`,
        ],
      }),
    )[0];

    return review;
  },
);

const fetchSubOrderFromFirebase = createAsyncThunk(
  FETCH_SUB_ORDER_FROM_FIREBASE,
  async (payload: any) => {
    const { subOrderDocumentId, subOrderType } = payload;

    const { data: response } = await fetchParticipantFirebaseSubOrderApi(
      subOrderDocumentId,
    );

    return subOrderType === ESubOrderTxStatus.DELIVERING
      ? {
          deliveringSubOrder: response,
        }
      : {
          deliveredSubOrder: response,
        };
  },
);

export const SubOrdersThunks = {
  fetchSubOrdersFromFirebase,
  fetchReviewFromSubOrder,
  fetchSubOrderFromFirebase,
};

// ================ Slice ================ //
const SubOrdersSlice = createSlice({
  name: 'SubOrders',
  initialState,
  reducers: {
    logout: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubOrdersFromFirebase.pending, (state) => {
        state.fetchSubOrdersInProgress = true;
        state.fetchSubOrdersError = null;
      })
      .addCase(fetchSubOrdersFromFirebase.fulfilled, (state, action) => {
        return {
          ...state,
          fetchSubOrdersInProgress: false,
          fetchSubOrdersError: null,
          ...(action.payload.deliveredSubOrders && {
            deliveredSubOrders: uniqBy(
              [
                ...state.deliveredSubOrders,
                ...action.payload.deliveredSubOrders,
              ],
              'id',
            ),
            deliveredLastRecord:
              action.payload.deliveredSubOrders[
                action.payload.deliveredSubOrders.length - 1
              ]?.createdAt?.seconds,
          }),
          ...(action.payload.deliveringSubOrders && {
            deliveringSubOrders: uniqBy(
              [
                ...state.deliveringSubOrders,
                ...action.payload.deliveringSubOrders,
              ],
              'id',
            ),
            deliveringLastRecord:
              action.payload.deliveringSubOrders[
                action.payload.deliveringSubOrders.length - 1
              ]?.createdAt?.seconds,
          }),
        };
      })
      .addCase(fetchSubOrdersFromFirebase.rejected, (state, action) => {
        state.fetchSubOrdersInProgress = false;
        state.fetchSubOrdersError = action.error.message;
      })

      .addCase(fetchReviewFromSubOrder.pending, (state) => {
        state.fetchReviewInProgress = true;
        state.fetchReviewError = null;
      })
      .addCase(fetchReviewFromSubOrder.fulfilled, (state, action) => {
        state.fetchReviewInProgress = false;
        state.fetchReviewError = null;
        state.subOrderReview = uniqBy(
          state.subOrderReview.concat(action.payload),
          'id.uuid',
        );
      })
      .addCase(fetchReviewFromSubOrder.rejected, (state, action) => {
        state.fetchReviewInProgress = false;
        state.fetchReviewError = action.error.message;
      })

      .addCase(fetchSubOrderFromFirebase.pending, (state) => {
        state.fetchSubOrderInProgress = true;
        state.fetchSubOrderError = null;
      })
      .addCase(fetchSubOrderFromFirebase.fulfilled, (state, { payload }) => {
        return {
          ...state,
          fetchSubOrderInProgress: false,
          ...(payload.deliveredSubOrder && {
            deliveredSubOrders: state.deliveredSubOrders.map((subOrder) =>
              subOrder.id === payload.deliveredSubOrder.id
                ? payload.deliveredSubOrder
                : subOrder,
            ),
          }),
          ...(payload.deliveringSubOrder && {
            deliveringSubOrders: state.deliveringSubOrders.map(
              (subOrder: any) =>
                subOrder.id === payload.deliveringSubOrder.id
                  ? payload.deliveringSubOrder
                  : subOrder,
            ),
          }),
        };
      })
      .addCase(fetchSubOrderFromFirebase.rejected, (state, action) => {
        state.fetchSubOrderInProgress = false;
        state.fetchSubOrderError = action.error.message;
      });
  },
});

// ================ Actions ================ //
export const SubOrdersActions = SubOrdersSlice.actions;
export default SubOrdersSlice.reducer;

// ================ Selectors ================ //
