import { createSlice, current } from '@reduxjs/toolkit';
import isEmpty from 'lodash/isEmpty';

import {
  createPaymentRecordApi,
  deletePaymentRecordApi,
  getPaymentRecordsApi,
  transitPlanApi,
} from '@apis/admin';
import { participantSubOrderUpdateDocumentApi } from '@apis/firebaseApi';
import {
  adminUpdateOrderStateApi,
  getBookerOrderDataApi,
  updateOrderApi,
  updatePlanDetailsApi,
} from '@apis/orderApi';
import { getOrderQuotationsQuery } from '@helpers/listingSearchQuery';
import { createAsyncThunk } from '@redux/redux.helper';
import { OrderManagementsAction } from '@redux/slices/OrderManagement.slice';
import { SystemAttributesThunks } from '@redux/slices/systemAttributes.slice';
import {
  denormalisedResponseEntities,
  Listing,
  Transaction,
} from '@src/utils/data';
import { ESubOrderTxStatus, ETransactionRoles } from '@src/utils/enums';
import { ETransition } from '@src/utils/transaction';
import type {
  TListing,
  TObject,
  TPagination,
  TTransaction,
  TUser,
} from '@src/utils/types';

const transitionShouldChangeFirebaseSubOrderStatus = [
  ETransition.START_DELIVERY,
  ETransition.COMPLETE_DELIVERY,
];
const mapTxTransitionToFirebaseSubOrderStatus = (lastTransition: string) => {
  switch (lastTransition) {
    case ETransition.START_DELIVERY:
      return ESubOrderTxStatus.DELIVERING;
    case ETransition.COMPLETE_DELIVERY:
      return ESubOrderTxStatus.DELIVERED;
    case ETransition.OPERATOR_CANCEL_PLAN:
      return ESubOrderTxStatus.CANCELED;
    default:
      return ESubOrderTxStatus.PENDING;
  }
};

// ================ Initial states ================ //
type TOrderDetailState = {
  order: TListing;
  orderDetail: any;
  company: TUser;
  booker: TUser;
  participantData: Array<TUser>;
  anonymousParticipantData: Array<TUser>;
  transactionDataMap: {
    [date: number]: TTransaction;
  };
  fetchOrderInProgress: boolean;
  fetchOrderError: any;

  transitInProgress: boolean;
  transitError: any;

  updateOrderStaffNameInProgress: boolean;
  updateOrderStaffNameError: any;

  updateOrderStateInProgress: boolean;
  updateOrderStateError: any;

  quotations: TListing[];
  quotationsPagination: TPagination;
  fetchQuotationsInProgress: boolean;
  fetchQuotationsError: any;

  partnerPaymentRecords: {
    [subOrderDate: string]: any[];
  };
  fetchPartnerPaymentRecordsInProgress: boolean;
  fetchPartnerPaymentRecordsError: any;

  createPartnerPaymentRecordInProgress: boolean;
  createPartnerPaymentRecordError: any;

  deletePartnerPaymentRecordInProgress: boolean;
  deletePartnerPaymentRecordError: any;
};
const initialState: TOrderDetailState = {
  order: null!,
  orderDetail: {},
  company: null!,
  booker: null!,
  participantData: [],
  anonymousParticipantData: [],
  transactionDataMap: {},
  fetchOrderInProgress: false,
  fetchOrderError: null,

  transitInProgress: false,
  transitError: null,

  updateOrderStaffNameInProgress: false,
  updateOrderStaffNameError: null,

  updateOrderStateInProgress: false,
  updateOrderStateError: null,

  quotations: [],
  quotationsPagination: null!,
  fetchQuotationsInProgress: false,
  fetchQuotationsError: null,
  partnerPaymentRecords: {},

  fetchPartnerPaymentRecordsInProgress: false,
  fetchPartnerPaymentRecordsError: null,

  createPartnerPaymentRecordInProgress: false,
  createPartnerPaymentRecordError: null,

  deletePartnerPaymentRecordInProgress: false,
  deletePartnerPaymentRecordError: null,
};

// ================ Thunk types ================ //
const FETCH_ORDER = 'app/OrderDetail/FETCH_ORDER';
const UPDATE_STAFF_NAME = 'app/OrderDetail/UPDATE_STAFF_NAME';
const UPDATE_ORDER_STATE = 'app/OrderDetail/UPDATE_ORDER_STATE';
const FETCH_QUOTATIONS = 'app/OrderDetail/FETCH_QUOTATIONS';
const CREATE_PARTNER_PAYMENT_RECORD =
  'app/OrderDetail/CREATE_PARTNER_PAYMENT_RECORD';
const FETCH_PARTNER_PAYMENT_RECORD =
  'app/OrderDetail/FETCH_PARTNER_PAYMENT_RECORD';
const DELETE_PARTNER_PAYMENT_RECORD =
  'app/OrderDetail/DELETE_PARTNER_PAYMENT_RECORD';
// ================ Async thunks ================ //
const fetchOrder = createAsyncThunk(
  FETCH_ORDER,
  async (orderId: string, { dispatch }) => {
    const response = await getBookerOrderDataApi(orderId);

    const {
      bookerData: booker,
      companyData: company,
      planListing,
      transactionDataMap,
      orderListing: order,
      participantData,
      anonymousParticipantData,
    } = response?.data || {};
    const { orderDetail } = Listing(planListing).getMetadata();

    dispatch(SystemAttributesThunks.fetchVATPercentageByOrderId(orderId));

    return {
      order,
      orderDetail,
      company,
      booker,
      transactionDataMap,
      participantData,
      anonymousParticipantData,
    };
  },
);

const updateStaffName = createAsyncThunk(
  UPDATE_STAFF_NAME,
  async (payload: { orderId: string; staffName: string }, { dispatch }) => {
    const { orderId, staffName } = payload;
    const apiBody = {
      generalInfo: {
        staffName,
      },
    };
    dispatch(OrderManagementsAction.updateStaffName(staffName));

    const { data: orderListing } = await updateOrderApi(orderId, apiBody);

    return orderListing;
  },
);

const updateOrderState = createAsyncThunk(
  UPDATE_ORDER_STATE,
  async (payload: { orderId: string; orderState: string }) => {
    const { data: orderListing } = await adminUpdateOrderStateApi({
      orderId: payload.orderId,
      orderState: payload.orderState,
    });

    return orderListing;
  },
);

const transit = createAsyncThunk(
  'app/OrderDetail/TRANSIT',
  async ({ transactionId, transition }: TObject) => {
    const { data: response } = await transitPlanApi({
      transactionId,
      transition,
    });

    const { tx } = response;
    const txGetter = Transaction(tx as TTransaction);
    const { booking } = txGetter.getFullData();
    const { displayStart } = booking.attributes;
    const { lastTransition } = txGetter.getAttributes();
    const { planId, participantIds = [] } = txGetter.getMetadata();
    const firebaseSubOrderIdList = participantIds.map(
      (id: string) => `${id} - ${planId} - ${new Date(displayStart).getTime()}`,
    );

    if (transitionShouldChangeFirebaseSubOrderStatus.includes(lastTransition)) {
      firebaseSubOrderIdList.map(async (subOrderId: string) => {
        await participantSubOrderUpdateDocumentApi({
          subOrderId,
          params: {
            txStatus: mapTxTransitionToFirebaseSubOrderStatus(lastTransition),
          },
        });
      });
    }

    return { transactionId, transition, createdAt: new Date().toISOString() };
  },
);

const fetchQuotations = createAsyncThunk(
  FETCH_QUOTATIONS,
  async (orderId: string, { extra: sdk }) => {
    const query = getOrderQuotationsQuery({ orderId });
    const response = await sdk.listings.query(query);

    const { meta } = response;
    const quotations = denormalisedResponseEntities(response);

    return {
      quotations,
      quotationsPagination: meta,
    };
  },
);

const updatePlanDetail = createAsyncThunk(
  'app/OrderDetail/UPDATE_PLAN_DETAIL',
  async (
    { orderId, planId, orderDetail, skipRefetch = false }: TObject,
    { dispatch, fulfillWithValue, rejectWithValue },
  ) => {
    try {
      await updatePlanDetailsApi(orderId, {
        orderDetail,
        planId,
        updateMode: 'direct_update',
      });

      if (skipRefetch) {
        return fulfillWithValue(orderDetail);
      }
      if (orderId) {
        await dispatch(fetchOrder(orderId));
      }

      return fulfillWithValue(null);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

const fetchPartnerPaymentRecords = createAsyncThunk(
  FETCH_PARTNER_PAYMENT_RECORD,
  async (query: any) => {
    const { data: partnerPaymentRecords } = await getPaymentRecordsApi({
      dataParams: query,
    });

    return partnerPaymentRecords;
  },
);

const createPartnerPaymentRecord = createAsyncThunk(
  CREATE_PARTNER_PAYMENT_RECORD,
  async (payload: TObject, { getState }) => {
    const { partnerPaymentRecords = {} } = getState().OrderDetail;
    const { paymentType, subOrderDate } = payload;
    const apiBody = {
      paymentRecordType: paymentType,
      paymentRecordParams: {
        ...payload,
      },
    };
    const { data: newPaymentRecord } = await createPaymentRecordApi(apiBody);
    const currentPaymentRecordsBySubOrder =
      partnerPaymentRecords[subOrderDate] || {};
    const newPartnerPaymentRecords = {
      ...partnerPaymentRecords,
      [subOrderDate]: [...currentPaymentRecordsBySubOrder, newPaymentRecord],
    };

    return newPartnerPaymentRecords;
  },
);

const deletePartnerPaymentRecord = createAsyncThunk(
  DELETE_PARTNER_PAYMENT_RECORD,
  async (paymentRecordId: string, { getState }) => {
    const { partnerPaymentRecords = {} } = getState().OrderDetail;
    await deletePaymentRecordApi({ paymentRecordId });

    const newPartnerPaymentRecords = Object.entries(
      partnerPaymentRecords,
    ).reduce((acc: any, [subOrderDate, paymentRecords]) => {
      const newPaymentRecords = paymentRecords.filter(
        (paymentRecord: any) => paymentRecord.id !== paymentRecordId,
      );
      acc[subOrderDate] = newPaymentRecords;

      return acc;
    }, {});

    return newPartnerPaymentRecords;
  },
);

export const OrderDetailThunks = {
  fetchOrder,
  updateStaffName,
  updateOrderState,
  fetchQuotations,
  transit,
  updatePlanDetail,
  fetchPartnerPaymentRecords,
  createPartnerPaymentRecord,
  deletePartnerPaymentRecord,
};

// ================ Slice ================ //
const OrderDetailSlice = createSlice({
  name: 'OrderDetail',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrder.pending, (state) => ({
        ...state,
        fetchOrderInProgress: true,
        fetchOrderError: null,
      }))
      .addCase(fetchOrder.fulfilled, (state, { payload }) => ({
        ...state,
        fetchOrderInProgress: false,
        ...payload,
      }))
      .addCase(fetchOrder.rejected, (state, { error }) => ({
        ...state,
        fetchOrderInProgress: false,
        fetchOrderError: error.message,
      }))

      .addCase(updateStaffName.pending, (state) => ({
        ...state,
        updateOrderStaffNameInProgress: true,
        updateOrderStaffNameError: null,
      }))
      .addCase(updateStaffName.fulfilled, (state, { payload }) => ({
        ...state,
        updateOrderStaffNameInProgress: false,
        order: payload,
      }))
      .addCase(updateStaffName.rejected, (state, { error }) => ({
        ...state,
        updateOrderStaffNameInProgress: false,
        updateOrderStaffNameError: error.message,
      }))

      .addCase(updateOrderState.pending, (state) => ({
        ...state,
        updateOrderStateInProgress: true,
        updateOrderStateError: null,
      }))
      .addCase(updateOrderState.fulfilled, (state, { payload }) => ({
        ...state,
        updateOrderStateInProgress: false,
        order: payload,
      }))
      .addCase(updateOrderState.rejected, (state, { error }) => ({
        ...state,
        updateOrderStateInProgress: false,
        updateOrderStateError: error.message,
      }))

      .addCase(fetchQuotations.pending, (state) => ({
        ...state,
        fetchQuotationsInProgress: true,
        fetchQuotationsError: null,
      }))
      .addCase(fetchQuotations.fulfilled, (state, { payload }) => ({
        ...state,
        fetchQuotationsInProgress: false,
        quotations: payload.quotations,
        quotationsPagination: payload.quotationsPagination,
      }))
      .addCase(fetchQuotations.rejected, (state, { error }) => ({
        ...state,
        fetchQuotationsInProgress: false,
        fetchQuotationsError: error.message,
      }))
      /* =============== transit =============== */
      .addCase(transit.pending, (state) => {
        state.transitInProgress = true;
        state.transitError = null;
      })
      .addCase(transit.fulfilled, (state, { payload }) => {
        const { transactionId, transition, createdAt } = payload;
        const currentState = current(state);
        const currOrderDetail = currentState.orderDetail;
        const currTxMap = currentState.transactionDataMap || {};
        const updateEnTry = Object.entries(currTxMap).find(
          ([_, txData]) => Transaction(txData).getId() === transactionId,
        );

        if (updateEnTry) {
          const [date, txData] = updateEnTry;

          const updateTxData = {
            ...txData,
            attributes: {
              ...txData?.attributes,
              transitions: (
                (txData?.attributes?.transitions || []) as any[]
              ).concat({
                createdAt,
                transition,
                by: ETransactionRoles.operator,
              }),
              lastTransition: transition,
              lastTransitionedAt: createdAt,
            },
          };

          state.transactionDataMap = { ...currTxMap, [date]: updateTxData };
          state.orderDetail = {
            ...currOrderDetail,
            [date]: {
              ...currOrderDetail[date],
              status: 'canceled',
            },
          };
        }

        state.transitInProgress = false;
      })
      .addCase(transit.rejected, (state, { error }) => {
        state.transitInProgress = false;
        state.transitError = error.message;
      })
      /* =============== updatePlanDetail =============== */
      .addCase(updatePlanDetail.pending, (state) => {
        return state;
      })
      .addCase(updatePlanDetail.fulfilled, (state, { payload }) => {
        if (payload !== null && !isEmpty(payload)) {
          state.orderDetail = payload;
        }
      })
      .addCase(updatePlanDetail.rejected, (state) => {
        return state;
      })

      .addCase(fetchPartnerPaymentRecords.pending, (state) => {
        state.fetchPartnerPaymentRecordsInProgress = true;
        state.fetchPartnerPaymentRecordsError = null;
      })
      .addCase(fetchPartnerPaymentRecords.fulfilled, (state, { payload }) => {
        state.fetchPartnerPaymentRecordsInProgress = false;
        state.partnerPaymentRecords = payload;
      })
      .addCase(fetchPartnerPaymentRecords.rejected, (state, { error }) => {
        state.fetchPartnerPaymentRecordsInProgress = false;
        state.fetchPartnerPaymentRecordsError = error.message;
      })

      .addCase(createPartnerPaymentRecord.pending, (state) => {
        state.createPartnerPaymentRecordInProgress = true;
        state.createPartnerPaymentRecordError = null;
      })
      .addCase(createPartnerPaymentRecord.fulfilled, (state, { payload }) => {
        state.createPartnerPaymentRecordInProgress = false;
        state.partnerPaymentRecords = payload;
      })
      .addCase(createPartnerPaymentRecord.rejected, (state, { error }) => {
        state.createPartnerPaymentRecordInProgress = false;
        state.createPartnerPaymentRecordError = error.message;
      });
  },
});

// ================ Actions ================ //
export const OrderDetailActions = OrderDetailSlice.actions;
export default OrderDetailSlice.reducer;

// ================ Selectors ================ //
