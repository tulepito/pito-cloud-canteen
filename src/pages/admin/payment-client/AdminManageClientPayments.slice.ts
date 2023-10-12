/* eslint-disable no-restricted-syntax */
import { createSlice } from '@reduxjs/toolkit';
import { groupBy } from 'lodash';

import { createPaymentRecordApi } from '@apis/admin';
import { adminQueryAllClientPaymentsApi } from '@apis/companyApi';
import { createAsyncThunk } from '@redux/redux.helper';
import { EPaymentType } from '@src/utils/enums';
import type { TObject } from '@src/utils/types';

// ================ Initial states ================ //

const ADMIN_FETCH_CLIENT_PAYMENT =
  'app/AdminManageClientPayments/ADMIN_FETCH_CLIENT_PAYMENT';

const ADMIN_CREATE_CLIENT_PAYMENT =
  'app/AdminManageClientPayments/ADMIN_CREATE_CLIENT_PAYMENT';

type TAdminManageClientPaymentsState = {
  clientPaymentsMap: TObject;
  fetchClientPaymentsInProgress: boolean;
  fetchClientPaymentsError: any;

  createClientPaymentsInProgress: boolean;
  createClientPaymentsRecordsError: any;
};
const initialState: TAdminManageClientPaymentsState = {
  clientPaymentsMap: {},
  fetchClientPaymentsInProgress: false,
  fetchClientPaymentsError: null,

  createClientPaymentsInProgress: false,
  createClientPaymentsRecordsError: null,
};

// ================ Thunk types ================ //

// ================ Async thunks ================ //
const fetchPartnerPaymentRecords = createAsyncThunk(
  ADMIN_FETCH_CLIENT_PAYMENT,
  async () => {
    const { data: allPaymentRecords } = await adminQueryAllClientPaymentsApi();

    const paymentRecordsGroupedByOrderId = groupBy(
      allPaymentRecords,
      'orderId',
    );

    const orderIds = Object.keys(paymentRecordsGroupedByOrderId);

    const sortedRecordsGroupedByOrderId = orderIds.reduce((res, curr) => {
      return {
        ...res,
        [curr]: paymentRecordsGroupedByOrderId[curr].sort((r1, r2) =>
          r1.isHideFromHistory === true
            ? -1
            : r2.isHideFromHistory === true
            ? 1
            : 0,
        ),
      };
    }, {});

    return sortedRecordsGroupedByOrderId;
  },
);

const adminCreateClientPayment = createAsyncThunk(
  ADMIN_CREATE_CLIENT_PAYMENT,
  async (payload: any[], { getState }) => {
    const oldClientPaymentMap = {
      ...getState().AdminManageClientPayments.clientPaymentsMap,
    };
    const newClientPaymentRecords = await Promise.all(
      payload.map(async (paymentRecord) => {
        const apiBody = {
          paymentRecordType: EPaymentType.CLIENT,
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

    const mergedClientPaymentRecords = newClientPaymentRecords.reduce(
      (acc: any, newRecord: any) => {
        const { orderId } = newRecord;
        if (acc?.[orderId]) {
          return {
            ...acc,
            [orderId]: [newRecord, ...acc[orderId]],
          };
        }
        const newAcc = {
          ...acc,
          [orderId]: [newRecord],
        };

        return newAcc;
      },
      oldClientPaymentMap,
    );

    return mergedClientPaymentRecords;
  },
);

export const AdminManageClientPaymentsThunks = {
  fetchPartnerPaymentRecords,
  adminCreateClientPayment,
};

// ================ Slice ================ //
const AdminManageClientPaymentsSlice = createSlice({
  name: 'AdminManageClientPayments.slice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPartnerPaymentRecords.pending, (state) => {
        state.fetchClientPaymentsInProgress = true;
        state.fetchClientPaymentsError = null;
      })
      .addCase(fetchPartnerPaymentRecords.fulfilled, (state, { payload }) => {
        state.fetchClientPaymentsInProgress = false;
        state.clientPaymentsMap = payload;
      })
      .addCase(fetchPartnerPaymentRecords.rejected, (state, { error }) => {
        state.fetchClientPaymentsInProgress = false;
        state.fetchClientPaymentsError = error;
      })
      .addCase(adminCreateClientPayment.pending, (state) => {
        state.createClientPaymentsInProgress = true;
        state.createClientPaymentsRecordsError = null;
      })
      .addCase(adminCreateClientPayment.fulfilled, (state, { payload }) => {
        state.createClientPaymentsInProgress = false;
        state.clientPaymentsMap = payload;
      })
      .addCase(adminCreateClientPayment.rejected, (state, { error }) => {
        state.createClientPaymentsInProgress = false;
        state.createClientPaymentsRecordsError = error;
      });
  },
});

// ================ Actions ================ //
export const AdminManageClientPaymentsActions =
  AdminManageClientPaymentsSlice.actions;
export default AdminManageClientPaymentsSlice.reducer;

// ================ Selectors ================ //
