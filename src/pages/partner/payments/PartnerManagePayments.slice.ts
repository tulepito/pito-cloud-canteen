import { createSlice } from '@reduxjs/toolkit';
import groupBy from 'lodash/groupBy';

import { getPartnerPaymentRecordsApi } from '@apis/admin';
import { createAsyncThunk } from '@redux/redux.helper';
import type { TObject } from '@src/utils/types';

// ================ Initial states ================ //
type TPartnerManagePaymentsState = {
  paymentPartnerRecords: TObject;
  fetchPaymentRecordsInProgress: boolean;
  fetchPaymentsRecordsError: any;
};
const initialState: TPartnerManagePaymentsState = {
  paymentPartnerRecords: {},
  fetchPaymentRecordsInProgress: false,
  fetchPaymentsRecordsError: null,
};

// ================ Thunk types ================ //
const FETCH_PARTNER_PAYMENT_RECORDS = 'app/PartnerManagePayments/LOAD_DATA';

// ================ Async thunks ================ //

const loadData = createAsyncThunk(FETCH_PARTNER_PAYMENT_RECORDS, async () => {
  const { data: allPaymentRecords } = await getPartnerPaymentRecordsApi();

  const paymentRecordsGroupedByOrderId = groupBy(allPaymentRecords, 'orderId');

  const paymentRecordBySubOrder = Object.keys(
    paymentRecordsGroupedByOrderId,
  ).reduce((result: any, orderId: string) => {
    const paymentRecordsGroupedBySubOrderDate = groupBy(
      paymentRecordsGroupedByOrderId[orderId],
      'subOrderDate',
    );

    return {
      ...result,
      [orderId]: {
        ...paymentRecordsGroupedBySubOrderDate,
      },
    };
  }, {});

  return paymentRecordBySubOrder;
});

export const PartnerManagePaymentsThunks = {
  loadData,
};

// ================ Slice ================ //
const PartnerManagePaymentsSlice = createSlice({
  name: 'PartnerManagePayments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadData.pending, (state) => {
      state.fetchPaymentRecordsInProgress = true;
      state.fetchPaymentsRecordsError = null;
    });
    builder.addCase(loadData.fulfilled, (state, { payload }) => {
      state.fetchPaymentRecordsInProgress = false;
      state.paymentPartnerRecords = payload;
    });
    builder.addCase(loadData.rejected, (state, action) => {
      state.fetchPaymentRecordsInProgress = false;
      state.fetchPaymentsRecordsError = action.payload;
    });
  },
});

// ================ Actions ================ //
export const PartnerManagePaymentsActions = PartnerManagePaymentsSlice.actions;
export default PartnerManagePaymentsSlice.reducer;

// ================ Selectors ================ //
