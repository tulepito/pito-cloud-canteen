/* eslint-disable no-restricted-syntax */
import { createSlice } from '@reduxjs/toolkit';
import { groupBy, uniqBy } from 'lodash';
import uniq from 'lodash/uniq';

import {
  createPaymentRecordApi,
  transitionOrderPaymentStatusApi,
} from '@apis/admin';
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
  rawClientPaymentRecords: TObject[];
  clientPaymentsMap: TObject;
  fetchClientPaymentsInProgress: boolean;
  fetchClientPaymentsError: any;

  createClientPaymentsInProgress: boolean;
  createClientPaymentsRecordsError: any;

  lastPaymentRecord: number;
};
const initialState: TAdminManageClientPaymentsState = {
  rawClientPaymentRecords: [],
  clientPaymentsMap: {},
  fetchClientPaymentsInProgress: false,
  fetchClientPaymentsError: null,

  createClientPaymentsInProgress: false,
  createClientPaymentsRecordsError: null,

  lastPaymentRecord: 0,
};

// ================ Thunk types ================ //

// ================ Async thunks ================ //
const fetchClientPaymentRecords = createAsyncThunk(
  ADMIN_FETCH_CLIENT_PAYMENT,
  async (_, { getState }) => {
    const { lastPaymentRecord, rawClientPaymentRecords } =
      getState().AdminManageClientPayments;
    const { data: allPaymentRecords } = await adminQueryAllClientPaymentsApi(
      lastPaymentRecord,
    );

    const newRawClientPaymentRecords = uniqBy(
      [...rawClientPaymentRecords, ...allPaymentRecords],
      'id',
    );

    const paymentRecordsGroupedByOrderId = groupBy(
      newRawClientPaymentRecords,
      'orderId',
    );

    const orderIds = Object.keys(paymentRecordsGroupedByOrderId);

    const sortedRecordsGroupedByOrderId = orderIds.reduce((res, curr) => {
      return {
        ...res,
        [curr]: paymentRecordsGroupedByOrderId[curr],
      };
    }, {});

    const newLastPaymentRecord =
      allPaymentRecords[allPaymentRecords.length - 1]?.createdAt?.seconds;

    return {
      sortedRecordsGroupedByOrderId,
      lastPaymentRecord: newLastPaymentRecord,
      rawClientPaymentRecords: newRawClientPaymentRecords,
    };
  },
);

const adminCreateClientPayment = createAsyncThunk(
  ADMIN_CREATE_CLIENT_PAYMENT,
  async (payload: any[], { getState }) => {
    const oldClientPaymentMap = {
      ...getState().AdminManageClientPayments.clientPaymentsMap,
    };

    const orderIdList: string[] = uniq(payload.map(({ orderId }) => orderId));

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
    orderIdList.map(async (orderId: string) =>
      transitionOrderPaymentStatusApi(orderId, ''),
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
  fetchClientPaymentRecords,
  adminCreateClientPayment,
};

// ================ Slice ================ //
const AdminManageClientPaymentsSlice = createSlice({
  name: 'AdminManageClientPayments.slice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClientPaymentRecords.pending, (state) => {
        state.fetchClientPaymentsInProgress = true;
        state.fetchClientPaymentsError = null;
      })
      .addCase(fetchClientPaymentRecords.fulfilled, (state, { payload }) => {
        state.fetchClientPaymentsInProgress = false;
        state.clientPaymentsMap = payload.sortedRecordsGroupedByOrderId;
        state.lastPaymentRecord = payload.lastPaymentRecord;
        state.rawClientPaymentRecords = payload.rawClientPaymentRecords;
      })
      .addCase(fetchClientPaymentRecords.rejected, (state, { error }) => {
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
