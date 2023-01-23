import { createAsyncThunk } from '@redux/redux.helper';
import type { RootState } from '@redux/store';
import { createSlice } from '@reduxjs/toolkit';
import {
  addParticipantToOrderApi,
  addUpdateMemberOrder,
  deleteParticipantFromOrderApi,
  loadBookerOrderDataApi,
  sendRemindEmailToMemberApi,
  updateOrderDetailsApi,
} from '@utils/api';
import { EParticipantOrderStatus } from '@utils/enums';
import type { TCompany, TObject, TUser } from '@utils/types';
import omit from 'lodash/omit';

// ================ Initial states ================ //
type TOrderManagementState = {
  // Fetch data state
  isFetchingOrderDetails: boolean;
  // Delete state
  isDeletingParticipant: boolean;
  // Update state
  isUpdatingOrderDetails: boolean;
  // Send email state
  isSendingRemindEmail: boolean;
  // Data states
  companyId: string | null;
  companyData: TCompany | null;
  orderData: TObject | null;
  planData: TObject;
  participantData: Array<TUser>;
};
const initialState: TOrderManagementState = {
  isFetchingOrderDetails: false,
  isDeletingParticipant: false,
  isUpdatingOrderDetails: false,
  isSendingRemindEmail: false,
  companyId: null,
  companyData: null,
  orderData: {},
  planData: {},
  participantData: [],
};

// ================ Thunk types ================ //

// ================ Async thunks ================ //
const loadData = createAsyncThunk(
  'app/OrderManagement/LOAD_DATA',
  async (orderId: string) => {
    const response: any = await loadBookerOrderDataApi(orderId);
    return response.data;
  },
);

const updateOrderGeneralInfo = createAsyncThunk(
  'app/OrderManagement/UPDATE_ORDER_GENERAL_INFO',
  async (params: TObject, { getState, dispatch }) => {
    const orderData = getState().OrderManagement.orderData!;
    const {
      id: { uuid: orderId },
      attributes: { metadata },
    } = orderData;

    const updateParams = {
      data: {
        metadata: {
          ...metadata,
          generalInfo: {
            ...metadata.generalInfo,
            ...params,
          },
        },
      },
    };

    await updateOrderDetailsApi(orderId, updateParams);
    await dispatch(loadData(orderId));
  },
);

const sendRemindEmailToMember = createAsyncThunk(
  'app/OrderManagement/SEND_REMIND_EMAIL_TO_MEMBER',
  async (params: TObject, { getState }) => {
    const { orderLink, deadline, description } = params;

    const {
      id: { uuid: orderId },
    } = getState().OrderManagement.orderData!;
    const participantList = getState().OrderManagement.participantData!;
    const {
      attributes: {
        metadata: { orderDetail },
      },
    } = getState().OrderManagement.planData!;

    const memberIdList = Object.values(orderDetail).reduce(
      (result, currentDateOrders) => {
        const { memberOrders } = currentDateOrders as TObject;
        const memberIds = Object.entries(memberOrders).reduce(
          (ids: string[], [memberId, orders]) => {
            const { foodId, status } = orders as TObject;

            if (
              (foodId === '' &&
                status !== EParticipantOrderStatus.notAllowed) ||
              status === EParticipantOrderStatus.empty ||
              status === EParticipantOrderStatus.notJoined
            ) {
              return [...ids, memberId as string];
            }
            return ids;
          },
          [],
        );

        return [...(result as string[]), ...memberIds];
      },
      [],
    ) as string[];

    const uniqueMemberIdList = memberIdList.filter((item, pos) => {
      return memberIdList.indexOf(item) === pos;
    });

    const emailList = uniqueMemberIdList.map((id) => {
      const participant = participantList.find((p: TUser) => {
        return p.id.uuid === id;
      });
      return participant?.attributes.email;
    });

    sendRemindEmailToMemberApi(orderId, {
      orderLink,
      deadline,
      description,
      emailList,
    });
  },
);

const addOrUpdateMemberOrder = createAsyncThunk(
  'app/OrderManagement/ADD_OR_UPDATE_MEMBER_ORDER',
  async (params: TObject, { getState, dispatch }) => {
    const { currentViewDate, foodId, memberId, requirement } = params;
    const {
      id: { uuid: orderId },
    } = getState().OrderManagement.orderData!;
    const {
      id: { uuid: planId },
      attributes: { metadata },
    } = getState().OrderManagement.planData!;

    const memberOrderDetailOnUpdateDate =
      metadata?.orderDetail[currentViewDate].memberOrders[memberId];
    const { foodId: oldFoodId, status } = memberOrderDetailOnUpdateDate;

    if (foodId === '' || oldFoodId === foodId) {
      return;
    }
    let newMemberOrderValues = memberOrderDetailOnUpdateDate;

    switch (status) {
      case EParticipantOrderStatus.joined:
      case EParticipantOrderStatus.notAllowed:
        newMemberOrderValues = {
          ...newMemberOrderValues,
          foodId,
        };
        break;
      case EParticipantOrderStatus.empty:
      case EParticipantOrderStatus.notJoined:
        newMemberOrderValues = {
          ...newMemberOrderValues,
          foodId,
          status: EParticipantOrderStatus.joined,
        };
        break;
      case EParticipantOrderStatus.expired:
        break;
      default:
        break;
    }
    newMemberOrderValues = { ...newMemberOrderValues, requirement };

    const updateParams = {
      planId,
      orderDetail: {
        ...metadata.orderDetail,
        [currentViewDate]: {
          ...metadata.orderDetail[currentViewDate],
          memberOrders: {
            ...metadata.orderDetail[currentViewDate].memberOrders,
            [memberId]: newMemberOrderValues,
          },
        },
      },
    };

    await addUpdateMemberOrder(orderId, updateParams);
    await dispatch(loadData(orderId));
  },
);

const disallowMember = createAsyncThunk(
  'app/OrderManagement/DISALLOW_MEMBER',
  async (params: TObject, { getState, dispatch }) => {
    const { currentViewDate, memberId } = params;
    const {
      id: { uuid: orderId },
    } = getState().OrderManagement.orderData!;
    const {
      id: { uuid: planId },
      attributes: { metadata },
    } = getState().OrderManagement.planData!;

    const memberOrderDetailOnUpdateDate =
      metadata?.orderDetail[currentViewDate].memberOrders[memberId];
    const { status } = memberOrderDetailOnUpdateDate;

    const validStatuses = [
      EParticipantOrderStatus.notJoined,
      EParticipantOrderStatus.expired,
    ];

    if (validStatuses.includes(status)) {
      return;
    }

    const newMemberOrderValues = {
      ...memberOrderDetailOnUpdateDate,
      status: EParticipantOrderStatus.notAllowed,
    };

    const updateParams = {
      planId,
      orderDetail: {
        ...metadata.orderDetail,
        [currentViewDate]: {
          ...metadata.orderDetail[currentViewDate],
          memberOrders: {
            ...metadata.orderDetail[currentViewDate].memberOrders,
            [memberId]: newMemberOrderValues,
          },
        },
      },
    };

    await addUpdateMemberOrder(orderId, updateParams);
    await dispatch(loadData(orderId));
  },
);

const addParticipant = createAsyncThunk(
  'app/OrderManagement/ADD_PARTICIPANT',
  async (params: TObject, { getState, dispatch }) => {
    const { email } = params;
    const { companyId } = getState().OrderManagement;

    const {
      id: { uuid: orderId },
      attributes: {
        metadata: { participants = [] },
      },
    } = getState().OrderManagement.orderData!;
    const {
      id: { uuid: planId },
      attributes: {
        metadata: { orderDetail },
      },
    } = getState().OrderManagement.planData!;

    const bodyParams = {
      email,
      companyId,
      orderId,
      planId,
      participants,
      orderDetail,
    };

    await addParticipantToOrderApi(orderId, bodyParams);
    await dispatch(loadData(orderId));
  },
);

const deleteParticipant = createAsyncThunk(
  'app/OrderManagement/DELETE_PARTICIPANT',
  async (params: TObject, { getState, dispatch }) => {
    const { participantId } = params;
    const {
      id: { uuid: orderId },
      attributes: {
        metadata: { participants = [] },
      },
    } = getState().OrderManagement.orderData!;
    const {
      id: { uuid: planId },
      attributes: {
        metadata: { orderDetail },
      },
    } = getState().OrderManagement.planData!;

    const newOrderDetail = Object.entries(orderDetail).reduce(
      (result, current) => {
        const [date, orderDetailOnDate] = current;
        const { memberOrders } = orderDetailOnDate as TObject;

        return {
          ...result,
          [date]: {
            ...(orderDetailOnDate as TObject),
            memberOrders: omit(memberOrders, participantId),
          },
        };
      },
      {},
    );

    const bodyParams = {
      participantId,
      participants: participants.filter((pId: string) => pId !== participantId),
      newOrderDetail,
      planId,
    };

    await deleteParticipantFromOrderApi(orderId, bodyParams);
    await dispatch(loadData(orderId));
  },
);

export const orderManagementsThunks = {
  loadData,
  updateOrderGeneralInfo,
  addOrUpdateMemberOrder,
  sendRemindEmailToMember,
  disallowMember,
  addParticipant,
  deleteParticipant,
};

// ================ Slice ================ //
const OrderManagementSlice = createSlice({
  name: 'OrderManagement',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      /* =============== loadData =============== */
      .addCase(loadData.pending, (state) => {
        state.isFetchingOrderDetails = true;
      })
      .addCase(loadData.fulfilled, (state, { payload }) => {
        const {
          orderListing: orderData,
          planListing: planData,
          // eslint-disable-next-line unused-imports/no-unused-vars
          statusCode,
          ...restPayload
        } = payload;

        return {
          ...state,
          isFetchingOrderDetails: false,
          orderData,
          planData,
          ...restPayload,
        };
      })
      .addCase(loadData.rejected, (state) => {
        state.isFetchingOrderDetails = false;
      })
      /* =============== deleteParticipant =============== */
      .addCase(deleteParticipant.pending, (state) => {
        state.isDeletingParticipant = true;
      })
      .addCase(deleteParticipant.fulfilled, (state) => {
        state.isDeletingParticipant = false;
      })
      .addCase(deleteParticipant.rejected, (state) => {
        state.isDeletingParticipant = false;
      })
      /* =============== updateOrderGeneralInfo =============== */
      .addCase(updateOrderGeneralInfo.pending, (state) => {
        state.isUpdatingOrderDetails = true;
      })
      .addCase(updateOrderGeneralInfo.fulfilled, (state) => {
        state.isUpdatingOrderDetails = false;
      })
      .addCase(updateOrderGeneralInfo.rejected, (state) => {
        state.isUpdatingOrderDetails = false;
      })
      /* =============== sendRemindEmailToMember =============== */
      .addCase(sendRemindEmailToMember.pending, (state) => {
        state.isSendingRemindEmail = true;
      })
      .addCase(sendRemindEmailToMember.fulfilled, (state) => {
        state.isSendingRemindEmail = false;
      })
      .addCase(sendRemindEmailToMember.rejected, (state) => {
        state.isSendingRemindEmail = false;
      });
  },
});

// ================ Actions ================ //
export const OrderManagementsAction = OrderManagementSlice.actions;
export default OrderManagementSlice.reducer;

// ================ Selectors ================ //
export const orderDetailsAnyActionsInProgress = (state: RootState) => {
  const {
    isFetchingOrderDetails,
    isDeletingParticipant,
    isUpdatingOrderDetails,
    isSendingRemindEmail,
  } = state.OrderManagement;

  return (
    isFetchingOrderDetails ||
    isDeletingParticipant ||
    isUpdatingOrderDetails ||
    isSendingRemindEmail
  );
};
