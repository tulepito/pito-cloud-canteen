import { createSlice } from '@reduxjs/toolkit';
import groupBy from 'lodash/groupBy';

import {
  createPaymentRecordApi,
  getPartnerPaymentRecordsApi,
} from '@apis/admin';
import { createAsyncThunk } from '@redux/redux.helper';
import type { TObject } from '@src/utils/types';

// ================ Initial states ================ //
type TPaymentPartnerState = {
  paymentPartnerRecords: TObject;
  fetchPaymentPartnerRecordsInProgress: boolean;
  fetchPaymentPartnerRecordsError: any;

  createPaymentPartnerRecordsInProgress: boolean;
  createPaymentPartnerRecordsError: any;
};
const initialState: TPaymentPartnerState = {
  paymentPartnerRecords: {},
  fetchPaymentPartnerRecordsInProgress: false,
  fetchPaymentPartnerRecordsError: null,

  createPaymentPartnerRecordsInProgress: false,
  createPaymentPartnerRecordsError: null,
};

// ================ Thunk types ================ //
const FETCH_PARTNER_PAYMENT_RECORDS =
  'app/PaymentPartner/FETCH_PARTNER_PAYMENT_RECORDS';
const CREATE_PARTNER_PAYMENT_RECORDS =
  'app/PaymentPartner/CREATE_PARTNER_PAYMENT_RECORDS';
// ================ Async thunks ================ //

const fetchPartnerPaymentRecords = createAsyncThunk(
  FETCH_PARTNER_PAYMENT_RECORDS,
  async () => {
    const { data: allPaymentRecords } = await getPartnerPaymentRecordsApi();

    const paymentRecordsGrouppedByOrderId = groupBy(
      allPaymentRecords,
      'orderId',
    );

    const paymentRecordBySubOrder = Object.keys(
      paymentRecordsGrouppedByOrderId,
    ).reduce((result: any, orderId: string) => {
      const paymentRecordsGrouppedBySubOrderDate = groupBy(
        paymentRecordsGrouppedByOrderId[orderId],
        'subOrderDate',
      );

      return {
        ...result,
        [orderId]: {
          ...paymentRecordsGrouppedBySubOrderDate,
        },
      };
    }, {});

    return paymentRecordBySubOrder;
  },
);

const createPartnerPaymentRecords = createAsyncThunk(
  CREATE_PARTNER_PAYMENT_RECORDS,
  async (payload: any[], { getState }) => {
    const { paymentPartnerRecords } = getState().PaymentPartner;
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
        state.paymentPartnerRecords = payload;
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
