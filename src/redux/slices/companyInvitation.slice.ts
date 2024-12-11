import { createSlice } from '@reduxjs/toolkit';

import {
  checkInvitationApi,
  responseToInvitationApi,
} from '@apis/companyInvitationApi';
import type { ResponseToInvitationBody } from '@pages/api/invitation/response.api';
import { createAsyncThunk } from '@redux/redux.helper';
import type { TUser } from '@src/utils/types';
import { denormalisedResponseEntities } from '@utils/data';

type CheckInvitationResponse = {
  message: string;
};
type ResponseToInvitationResult = {
  message: string;
};
// ================ Initial states ================ //
type TCompanyInvitationState = {
  checkInvitationResult: any;
  checkInvitationInProgress: boolean;
  checkInvitationError: any;
  company: TUser | null;
  fetchCompanyInfoInProgress: boolean;

  responseToInvitationResult: string;
  responseToInvitationInProgress: boolean;
  responseToInvitationError: any;
};
const initialState: TCompanyInvitationState = {
  checkInvitationResult: null,
  checkInvitationInProgress: false,
  checkInvitationError: null,
  company: null,
  fetchCompanyInfoInProgress: false,

  responseToInvitationResult: null!,
  responseToInvitationInProgress: false,
  responseToInvitationError: null,
};

// ================ Thunk types ================ //
const CHECK_INVITATION = 'app/companyInvitation/CHECK_INVITATION';
const RESPONSE_TO_INVITATION = 'app/companyInvitation/RESPONSE_TO_INVITATION';
const FETCH_COMPANY_INFO = 'app/companyInvitation/FETCH_COMPANY_INFO';

// ================ Async thunks ================ //
const checkInvitation = createAsyncThunk(
  CHECK_INVITATION,
  async (companyId: string) => {
    const { data: checkInvitationResponse }: { data: CheckInvitationResponse } =
      await checkInvitationApi({
        companyId,
      });

    return checkInvitationResponse;
  },
);

const responseToInvitation = createAsyncThunk(
  RESPONSE_TO_INVITATION,
  async (params: ResponseToInvitationBody) => {
    const { data: response }: { data: ResponseToInvitationResult } =
      await responseToInvitationApi(params);

    return response.message;
  },
);

const fetchCompanyInfo = createAsyncThunk(
  FETCH_COMPANY_INFO,
  async (companyId: string, { extra: sdk }) => {
    const companyInfo = denormalisedResponseEntities(
      await sdk.users.show({
        id: companyId,
      }),
    )[0];

    return companyInfo;
  },
);

export const companyInvitationThunks = {
  checkInvitation,
  responseToInvitation,
  fetchCompanyInfo,
};

// ================ Slice ================ //
const companyInvitationSlice = createSlice({
  name: 'companyInvitation',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(checkInvitation.pending, (state) => {
        state.checkInvitationInProgress = true;
        state.checkInvitationError = null;
      })
      .addCase(checkInvitation.fulfilled, (state, { payload }) => {
        state.checkInvitationInProgress = false;
        state.checkInvitationResult = payload.message;
      })
      .addCase(checkInvitation.rejected, (state, { error }) => {
        state.checkInvitationInProgress = false;
        state.checkInvitationError = error.message;
      })

      .addCase(responseToInvitation.pending, (state) => {
        state.responseToInvitationInProgress = true;
        state.responseToInvitationError = null;
      })
      .addCase(responseToInvitation.fulfilled, (state, { payload }) => {
        state.responseToInvitationInProgress = false;
        state.responseToInvitationResult = payload;
      })
      .addCase(responseToInvitation.rejected, (state, { error }) => {
        state.responseToInvitationInProgress = false;
        state.responseToInvitationError = error.message;
      })

      .addCase(fetchCompanyInfo.pending, (state) => {
        state.fetchCompanyInfoInProgress = true;
      })
      .addCase(fetchCompanyInfo.fulfilled, (state, { payload }) => {
        state.fetchCompanyInfoInProgress = false;
        state.company = payload;
      })
      .addCase(fetchCompanyInfo.rejected, (state) => {
        state.fetchCompanyInfoInProgress = false;
      });
  },
});

// ================ Actions ================ //

export default companyInvitationSlice.reducer;

// ================ Selectors ================ //
