import { createSlice } from '@reduxjs/toolkit';
import { uniqBy } from 'lodash';
import groupBy from 'lodash/groupBy';
import uniq from 'lodash/uniq';

import {
  createPaymentRecordApi,
  getPartnerPaymentRecordsApi,
  transitionOrderPaymentStatusApi,
} from '@apis/admin';
import { createAsyncThunk } from '@redux/redux.helper';
import type { TObject } from '@src/utils/types';

// ================ Initial states ================ //
type TPaymentPartnerState = {
  rawPartnerPaymentRecords: TObject[];
  paymentPartnerRecords: TObject;
  fetchPaymentPartnerRecordsInProgress: boolean;
  fetchPaymentPartnerRecordsError: any;

  createPaymentPartnerRecordsInProgress: boolean;
  createPaymentPartnerRecordsError: any;

  lastPaymentRecord: number;
};
const initialState: TPaymentPartnerState = {
  rawPartnerPaymentRecords: [],
  paymentPartnerRecords: {},
  fetchPaymentPartnerRecordsInProgress: false,
  fetchPaymentPartnerRecordsError: null,

  createPaymentPartnerRecordsInProgress: false,
  createPaymentPartnerRecordsError: null,

  lastPaymentRecord: 0,
};

// ================ Thunk types ================ //
const FETCH_PARTNER_PAYMENT_RECORDS =
  'app/PaymentPartner/FETCH_PARTNER_PAYMENT_RECORDS';
const CREATE_PARTNER_PAYMENT_RECORDS =
  'app/PaymentPartner/CREATE_PARTNER_PAYMENT_RECORDS';
// ================ Async thunks ================ //

const fetchPartnerPaymentRecords = createAsyncThunk(
  FETCH_PARTNER_PAYMENT_RECORDS,
  async (_, { getState }) => {
    const { lastPaymentRecord, rawPartnerPaymentRecords } =
      getState().PaymentPartner;
    const { data: allPaymentRecords } = await getPartnerPaymentRecordsApi(
      lastPaymentRecord,
    );

    const newRawPartnerPaymentRecords = uniqBy(
      [...rawPartnerPaymentRecords, ...allPaymentRecords],
      'id',
    );

    const paymentRecordsGrouppedByOrderId = groupBy(
      newRawPartnerPaymentRecords,
      'orderId',
    );

    const paymentRecordBySubOrder = Object.keys(
      paymentRecordsGrouppedByOrderId,
    ).reduce((result: any, orderId: string) => {
      const paymentRecordsGrouppedBySubOrderDate = groupBy(
        paymentRecordsGrouppedByOrderId[orderId],
        'subOrderDate',
      );

      result[orderId] = {
        ...paymentRecordsGrouppedBySubOrderDate,
      };

      return result;
    }, {});

    const newLastPaymentRecord =
      newRawPartnerPaymentRecords[newRawPartnerPaymentRecords.length - 1]
        ?.createdAt?.seconds;

    return {
      paymentRecordBySubOrder,
      lastPaymentRecord: newLastPaymentRecord,
      rawPartnerPaymentRecords: newRawPartnerPaymentRecords,
    };
  },
);

const createPartnerPaymentRecords = createAsyncThunk(
  CREATE_PARTNER_PAYMENT_RECORDS,
  async (payload: any[], { getState }) => {
    const { paymentPartnerRecords } = getState().PaymentPartner;

    const orderIdList: string[] = uniq(payload.map(({ orderId }) => orderId));

    const newPartnerPaymentRecords = await Promise.all(
      payload.map(async (paymentRecord) => {
        const { paymentType } = paymentRecord;
        const apiBody = {
          paymentRecordType: paymentType,
          paymentRecordParams: {
            ...paymentRecord,
          },
        };
        const { data: newPartnerPaymentRecord } = await createPaymentRecordApi(
          apiBody,
        );

        return newPartnerPaymentRecord;
      }),
    );
    orderIdList.map(async (orderId: string) =>
      transitionOrderPaymentStatusApi(orderId, ''),
    );

    const mergedPaymentPartnerRecords = newPartnerPaymentRecords.reduce(
      (acc: any, newRecord: any) => {
        const { orderId, subOrderDate } = newRecord;
        if (acc?.[orderId]?.[subOrderDate]) {
          return {
            ...acc,
            [orderId]: {
              ...acc[orderId],
              [subOrderDate]: [newRecord, ...acc[orderId][subOrderDate]],
            },
          };
        }

        if (acc?.[orderId]) {
          return {
            ...acc,
            [orderId]: {
              ...acc[orderId],
              [subOrderDate]: [newRecord],
            },
          };
        }

        return acc;
      },
      paymentPartnerRecords,
    );

    return mergedPaymentPartnerRecords;
  },
);

export const PaymentPartnerThunks = {
  fetchPartnerPaymentRecords,
  createPartnerPaymentRecords,
};

// ================ Slice ================ //
const PaymentPartnerSlice = createSlice({
  name: 'PaymentPartner',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchPartnerPaymentRecords.pending, (state) => {
      state.fetchPaymentPartnerRecordsInProgress = true;
      state.fetchPaymentPartnerRecordsError = null;
    });
    builder.addCase(
      fetchPartnerPaymentRecords.fulfilled,
      (state, { payload }) => {
        state.fetchPaymentPartnerRecordsInProgress = false;
        state.rawPartnerPaymentRecords = payload.rawPartnerPaymentRecords;
        state.paymentPartnerRecords = payload.paymentRecordBySubOrder;
        state.lastPaymentRecord = payload.lastPaymentRecord;
      },
    );
    builder.addCase(fetchPartnerPaymentRecords.rejected, (state, action) => {
      state.fetchPaymentPartnerRecordsInProgress = false;
      state.fetchPaymentPartnerRecordsError = action.payload;
    });

    builder.addCase(createPartnerPaymentRecords.pending, (state) => {
      state.createPaymentPartnerRecordsInProgress = true;
      state.createPaymentPartnerRecordsError = null;
    });
    builder.addCase(
      createPartnerPaymentRecords.fulfilled,
      (state, { payload }) => {
        state.createPaymentPartnerRecordsInProgress = false;
        state.paymentPartnerRecords = payload;
      },
    );
    builder.addCase(createPartnerPaymentRecords.rejected, (state, action) => {
      state.createPaymentPartnerRecordsInProgress = false;
      state.createPaymentPartnerRecordsError = action.payload;
    });
  },
});

// ================ Actions ================ //
export const PaymentPartnerActions = PaymentPartnerSlice.actions;
export default PaymentPartnerSlice.reducer;

// ================ Selectors ================ //
