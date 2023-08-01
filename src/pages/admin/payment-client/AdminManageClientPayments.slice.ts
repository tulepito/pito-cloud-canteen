import { createSlice } from '@reduxjs/toolkit';

import { adminQueryAllClientPaymentsApi } from '@apis/companyApi';
import { createAsyncThunk } from '@redux/redux.helper';

// ================ Initial states ================ //

const ADMIN_FETCH_CLIENT_PAYMENT =
  'app/AdminManageClientPayments/ADMIN_FETCH_CLIENT_PAYMENT';

type TAdminManageClientPaymentsState = {
  clientPayments: any[];
  fetchClientPaymentsInProgress: boolean;
  fetchClientPaymentsError: any;

  createClientPaymentsInProgress: boolean;
  createClientPaymentsRecordsError: any;
};
const initialState: TAdminManageClientPaymentsState = {
  clientPayments: [],
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

    return allPaymentRecords;
  },
);
export const AdminManageClientPaymentsThunks = {
  fetchPartnerPaymentRecords,
};

// ================ Slice ================ //
const AdminManageClientPaymentsSlice = createSlice({
  name: 'AdminManageClientPayments.slice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchPartnerPaymentRecords.pending, (state) => {
      state.fetchClientPaymentsInProgress = true;
      state.fetchClientPaymentsError = null;
    });
    builder.addCase(
      fetchPartnerPaymentRecords.fulfilled,
      (state, { payload }) => {
        state.fetchClientPaymentsInProgress = false;
        state.clientPayments = payload;
      },
    );
    builder.addCase(fetchPartnerPaymentRecords.rejected, (state, action) => {
      state.fetchClientPaymentsInProgress = false;
      state.fetchClientPaymentsError = action.payload;
    });
  },
});

// ================ Actions ================ //
export const AdminManageClientPaymentsActions =
  AdminManageClientPaymentsSlice.actions;
export default AdminManageClientPaymentsSlice.reducer;

// ================ Selectors ================ //
