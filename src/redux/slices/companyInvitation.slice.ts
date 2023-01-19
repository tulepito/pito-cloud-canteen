import { createAsyncThunk } from '@redux/redux.helper';
import { createSlice } from '@reduxjs/toolkit';
import type { ResponseToInvitationApiBody } from '@utils/companyInvitationApi';
import {
  checkInvitationApi,
  reponseToInvitationApi,
} from '@utils/companyInvitationApi';

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

  responseToInvitationResult: string;
  responseToInvitationInProgress: boolean;
  responseToInvitationError: any;
};
const initialState: TCompanyInvitationState = {
  checkInvitationResult: null,
  checkInvitationInProgress: false,
  checkInvitationError: null,

  responseToInvitationResult: null!,
  responseToInvitationInProgress: false,
  responseToInvitationError: null,
};

// ================ Thunk types ================ //
const CHECK_INVITATION = 'app/companyInvitation/CHECK_INVITATION';
const RESPONSE_TO_INVITATION = 'app/companyInvitation/RESPONSE_TO_INVITATION';
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
  async (params: ResponseToInvitationApiBody) => {
    const { data: response }: { data: ResponseToInvitationResult } =
      await reponseToInvitationApi(params);
    return response.message;
  },
);
export const companyInvitationThunks = {
  checkInvitation,
  responseToInvitation,
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
      });
  },
});

// ================ Actions ================ //

export default companyInvitationSlice.reducer;

// ================ Selectors ================ //
