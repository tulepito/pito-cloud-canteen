import { createSlice } from '@reduxjs/toolkit';
import uniqBy from 'lodash/uniqBy';

import { participantSubOrderGetDocumentApi } from '@apis/firebaseApi';
import { createAsyncThunk } from '@redux/redux.helper';
import { denormalisedResponseEntities } from '@src/utils/data';
import { EImageVariants, ESubOrderTxStatus } from '@src/utils/enums';

const FIREBASE_LIMIT_RECORDS = 20;

// ================ Initial states ================ //
type TSubOrdersState = {
  subOrders: any[];
  deliveringSubOrders: any[];
  deliveredSubOrders: any[];
  fetchSubOrdersInProgress: boolean;
  fetchSubOrdersError: any;

  subOrderReview: any;
  fetchReviewInProgress: boolean;
  fetchReviewError: any;
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
};

// ================ Thunk types ================ //
const FETCH_SUB_ORDERS_FROM_FIREBASE =
  'app/SubOrders/FETCH_SUB_ORDERS_FROM_FIREBASE';

const FETCH_REVIEW_FROM_SUB_ORDER = 'app/SubOrders/FETCH_REVIEW_FROM_SUB_ORDER';
// ================ Async thunks ================ //

const fetchSubOrdersFromFirebase = createAsyncThunk(
  FETCH_SUB_ORDERS_FROM_FIREBASE,
  async (payload: any) => {
    const { participantId, txStatus, lastRecord } = payload;

    const { data: response } = await participantSubOrderGetDocumentApi(
      participantId,
      txStatus,
      FIREBASE_LIMIT_RECORDS,
      lastRecord,
    );

    return txStatus === ESubOrderTxStatus.DELIVERING
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

export const SubOrdersThunks = {
  fetchSubOrdersFromFirebase,
  fetchReviewFromSubOrder,
};

// ================ Slice ================ //
const SubOrdersSlice = createSlice({
  name: 'SubOrders',
  initialState,
  reducers: {},
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
          deliveredSubOrders: action.payload.deliveredSubOrders
            ? uniqBy(
                state.deliveredSubOrders.concat(
                  action.payload.deliveredSubOrders,
                ),
                'id',
              )
            : state.deliveredSubOrders,
          deliveringSubOrders: action.payload.deliveringSubOrders
            ? uniqBy(
                state.deliveringSubOrders.concat(
                  action.payload.deliveringSubOrders,
                ),
                'id',
              )
            : state.deliveringSubOrders,
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
      });
  },
});

// ================ Actions ================ //
export const SubOrdersActions = SubOrdersSlice.actions;
export default SubOrdersSlice.reducer;

// ================ Selectors ================ //
