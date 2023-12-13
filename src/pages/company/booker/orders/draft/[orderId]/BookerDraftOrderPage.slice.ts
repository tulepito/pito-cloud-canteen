import { toast } from 'react-toastify';
import { createSlice } from '@reduxjs/toolkit';
import uniq from 'lodash/uniq';

import {
  addParticipantToOrderApi,
  deleteParticipantFromOrderApi,
  getBookerOrderDataApi,
  sendRemindEmailToMemberApi,
} from '@apis/orderApi';
import { createAsyncThunk } from '@redux/redux.helper';
import { EOrderType } from '@src/utils/enums';
import { successToastOptions } from '@src/utils/toastify';
import { denormalisedResponseEntities, Listing } from '@utils/data';
import type { TListing, TObject, TUser } from '@utils/types';

// ================ Initial states ================ //
type TBookerDraftOrderPageState = {
  companyAccount: TUser | null;
  fetchCompanyAccountInProgress: boolean;
  fetchCompanyAccountError: any;
  selectedCalendarDate: Date;

  fetchOrderParticipantsInProgress: boolean;
  participantData: TObject[];

  addOrderParticipantsInProgress: boolean;
  toastShowedAfterSuccessfullyCreatingOrder: boolean;
  walkthroughStep: number;
};
const initialState: TBookerDraftOrderPageState = {
  companyAccount: null,
  fetchCompanyAccountInProgress: false,
  fetchCompanyAccountError: null,
  selectedCalendarDate: undefined!,

  fetchOrderParticipantsInProgress: false,
  participantData: [],

  addOrderParticipantsInProgress: false,
  toastShowedAfterSuccessfullyCreatingOrder: false,
  walkthroughStep: -1,
};

// ================ Thunk types ================ //
const FETCH_COMPANY_FROM_ORDER =
  'app/BookerDraftOrderPage/FETCH_COMPANY_FROM_ORDER';

// ================ Async thunks ================ //
const fetchCompanyAccount = createAsyncThunk(
  FETCH_COMPANY_FROM_ORDER,
  async (_, { getState, extra: sdk }) => {
    const { order } = getState().Order;
    const { companyId } = Listing(order as TListing).getMetadata();
    const companyAccount = denormalisedResponseEntities(
      await sdk.users.show({
        id: companyId,
      }),
    )[0];

    return {
      companyAccount,
    };
  },
);

const fetchOrderParticipants = createAsyncThunk(
  'app/BookerDraftOrderPage/FETCH_ORDER_PARTICIPANTS',
  async (_, { getState }) => {
    const { order } = getState().Order;
    const orderGetter = Listing(order as TListing);
    const { orderType = EOrderType.normal } = orderGetter.getMetadata();

    if (orderType === EOrderType.group) {
      const { data } = await getBookerOrderDataApi(orderGetter.getId());

      return data.participantData;
    }

    return [];
  },
);

const addOrderParticipants = createAsyncThunk(
  'app/BookerDraftOrderPage/ADD_ORDER_PARTICIPANTS',
  async ({ orderId, participants, newUserIds, newUsers }: TObject) => {
    const bodyParams = {
      orderId,
      participants,
      userIds: newUserIds,
    };

    await addParticipantToOrderApi(orderId, bodyParams);

    return newUsers;
  },
);

const deleteOrderParticipants = createAsyncThunk(
  'app/BookerDraftOrderPage/DELETE_ORDER_PARTICIPANTS',
  async ({ orderId, participantId, participants }: TObject, { getState }) => {
    const { participantData } = getState().BookerDraftOrderPage;
    const bodyParams = {
      orderId,
      participants,
      participantId,
    };

    await deleteParticipantFromOrderApi(orderId, bodyParams);

    return participantData.filter((p) => p.id.uuid !== participantId);
  },
);

const sendRemindEmailToMembers = createAsyncThunk(
  'app/OrderManagement/SEND_REMIND_EMAIL_TO_MEMBER',
  async (params: TObject) => {
    const { orderId, orderLink, deadline, description, memberIdList } = params;

    await sendRemindEmailToMemberApi(orderId, {
      orderLink,
      deadline,
      description,
      uniqueMemberIdList: uniq(memberIdList),
    });

    toast('Đã gửi lời mời đến thành viên', successToastOptions);
  },
);

export const BookerDraftOrderPageThunks = {
  fetchCompanyAccount,
  fetchOrderParticipants,
  addOrderParticipants,
  deleteOrderParticipants,
  sendRemindEmailToMembers,
};

// ================ Slice ================ //
const BookerDraftOrderPageSlice = createSlice({
  name: 'BookerDraftOrderPage',
  initialState,
  reducers: {
    selectCalendarDate: (state, { payload }) => ({
      ...state,
      selectedCalendarDate: payload,
    }),
    setToastShowedAfterSuccessfullyCreatingOrder: (state, { payload }) => ({
      ...state,
      toastShowedAfterSuccessfullyCreatingOrder: payload,
    }),
    setWalkthroughStep: (state, { payload }) => ({
      ...state,
      walkthroughStep: payload,
    }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanyAccount.pending, (state) => {
        state.fetchCompanyAccountInProgress = true;
        state.fetchCompanyAccountError = null;
      })
      .addCase(fetchCompanyAccount.fulfilled, (state, action) => {
        state.companyAccount = action.payload.companyAccount;
        state.fetchCompanyAccountInProgress = false;
      })
      .addCase(fetchCompanyAccount.rejected, (state, { payload }) => {
        state.fetchCompanyAccountInProgress = false;
        state.fetchCompanyAccountError = payload;
      })
      /* =============== fetchOrderParticipants =============== */
      .addCase(fetchOrderParticipants.pending, (state) => {
        state.fetchOrderParticipantsInProgress = true;
      })
      .addCase(fetchOrderParticipants.fulfilled, (state, { payload }) => {
        state.fetchOrderParticipantsInProgress = false;
        state.participantData = payload;
      })
      .addCase(fetchOrderParticipants.rejected, (state) => {
        state.fetchOrderParticipantsInProgress = false;
      })
      /* =============== addOrderParticipants =============== */
      .addCase(addOrderParticipants.pending, (state) => {
        state.addOrderParticipantsInProgress = true;
      })
      .addCase(addOrderParticipants.fulfilled, (state, { payload }) => {
        state.addOrderParticipantsInProgress = false;
        state.participantData = state.participantData.concat(payload);
      })
      .addCase(addOrderParticipants.rejected, (state) => {
        state.addOrderParticipantsInProgress = false;
      })
      /* =============== deleteOrderParticipants =============== */
      .addCase(deleteOrderParticipants.pending, (state) => {
        return state;
      })
      .addCase(deleteOrderParticipants.fulfilled, (state, { payload }) => {
        state.participantData = payload;
      })
      .addCase(deleteOrderParticipants.rejected, (state) => {
        return state;
      });
  },
});

// ================ Actions ================ //
export const BookerDraftOrderPageActions = BookerDraftOrderPageSlice.actions;
export default BookerDraftOrderPageSlice.reducer;

// ================ Selectors ================ //
