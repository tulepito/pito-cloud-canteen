import { createSlice } from '@reduxjs/toolkit';
import groupBy from 'lodash/groupBy';
import omit from 'lodash/omit';

import {
  addParticipantToOrderApi,
  addUpdateMemberOrder,
  bookerMarkInprogressPlanViewedApi,
  bookerStartOrderApi,
  cancelPickingOrderApi,
  createQuotationApi,
  deleteParticipantFromOrderApi,
  getBookerOrderDataApi,
  sendRemindEmailToMemberApi,
  updateOrderApi,
} from '@apis/orderApi';
import { createAsyncThunk } from '@redux/redux.helper';
import type { RootState } from '@redux/store';
import { Listing } from '@utils/data';
import { EParticipantOrderStatus } from '@utils/enums';
import { storableError } from '@utils/errors';
import type {
  TCompany,
  TListing,
  TObject,
  TTransaction,
  TUser,
} from '@utils/types';

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
  // Cancel order state
  cancelPickingOrderInProgress: boolean;
  cancelPickingOrderError: any;
  //
  updateParticipantsInProgress: boolean;
  updateParticipantsError: any;
  //
  addOrUpdateMemberOrderInProgress: boolean;
  addOrUpdateMemberOrderError: any;

  isStartOrderInProgress: boolean;
  // Data states
  companyId: string | null;
  companyData: TCompany | null;
  orderData: TObject | null;
  planData: TObject;
  planViewed: boolean;
  bookerData: TUser | null;
  participantData: Array<TUser>;
  anonymousParticipantData: Array<TUser>;
  transactionDataMap: {
    [date: number]: TTransaction;
  };
};

const initialState: TOrderManagementState = {
  isFetchingOrderDetails: false,
  isDeletingParticipant: false,
  isUpdatingOrderDetails: false,
  isSendingRemindEmail: false,
  cancelPickingOrderInProgress: false,
  cancelPickingOrderError: null,
  updateParticipantsInProgress: false,
  updateParticipantsError: null,
  addOrUpdateMemberOrderInProgress: false,
  addOrUpdateMemberOrderError: null,
  isStartOrderInProgress: false,
  companyId: null,
  companyData: null,
  orderData: {},
  planData: {},
  planViewed: false,
  bookerData: null,
  participantData: [],
  anonymousParticipantData: [],
  transactionDataMap: {},
};

// ================ Thunk types ================ //

// ================ Async thunks ================ //
const loadData = createAsyncThunk(
  'app/OrderManagement/LOAD_DATA',
  async (orderId: string) => {
    const response: any = await getBookerOrderDataApi(orderId);

    return response.data;
  },
);

const updateOrderGeneralInfo = createAsyncThunk(
  'app/OrderManagement/UPDATE_ORDER_GENERAL_INFO',
  async (params: TObject, { getState, dispatch }) => {
    const orderData = getState().OrderManagement.orderData!;
    const {
      id: { uuid: orderId },
    } = orderData;

    const updateParams = {
      generalInfo: {
        ...params,
      },
    };

    await updateOrderApi(orderId, updateParams);
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

    await sendRemindEmailToMemberApi(orderId, {
      orderLink,
      deadline,
      description,
      uniqueMemberIdList,
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
      attributes: { metadata = {} },
    } = getState().OrderManagement.planData!;

    const memberOrderDetailOnUpdateDate =
      metadata?.orderDetail[currentViewDate.toString()].memberOrders[memberId];
    const { foodId: oldFoodId, status = EParticipantOrderStatus.empty } =
      memberOrderDetailOnUpdateDate || {};

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

const restoredDisAllowedMember = createAsyncThunk(
  'app/OrderManagement/RESTORE_DISALLOWED_MEMBER',
  async (params: TObject, { getState, dispatch }) => {
    const { currentViewDate, memberIds = [] } = params;
    const {
      id: { uuid: orderId },
    } = getState().OrderManagement.orderData!;
    const {
      id: { uuid: planId },
      attributes: { metadata },
    } = getState().OrderManagement.planData!;

    const updateMemberOrders = (memberIds as string[]).reduce<TObject>(
      (result, memberId) => {
        const memberOrderDetailOnUpdateDate =
          metadata?.orderDetail[currentViewDate].memberOrders[memberId];
        const { foodId } = memberOrderDetailOnUpdateDate;
        const newStatus =
          foodId === ''
            ? EParticipantOrderStatus.empty
            : EParticipantOrderStatus.joined;

        return {
          ...result,
          [memberId]: { ...memberOrderDetailOnUpdateDate, status: newStatus },
        };
      },
      {} as TObject,
    );

    const updateParams = {
      planId,
      orderDetail: {
        ...metadata.orderDetail,
        [currentViewDate]: {
          ...metadata.orderDetail[currentViewDate],
          memberOrders: {
            ...metadata.orderDetail[currentViewDate].memberOrders,
            ...(updateMemberOrders as TObject),
          },
        },
      },
    };

    await addUpdateMemberOrder(orderId, updateParams);
    await dispatch(loadData(orderId));
  },
);

const deleteDisAllowedMember = createAsyncThunk(
  'app/OrderManagement/DELETE_DISALLOWED_MEMBER',
  async (params: TObject, { getState, dispatch }) => {
    const { currentViewDate, memberIds = [] } = params;
    const {
      id: { uuid: orderId },
    } = getState().OrderManagement.orderData!;
    const {
      id: { uuid: planId },
      attributes: { metadata },
    } = getState().OrderManagement.planData!;

    const oldMemberOrders = metadata.orderDetail[currentViewDate].memberOrders;
    const newMemberOrders = (memberIds as string[]).reduce<TObject>(
      (result, memberId) => {
        return omit(result, memberId);
      },
      oldMemberOrders,
    );

    const updateParams = {
      planId,
      orderDetail: {
        ...metadata.orderDetail,
        [currentViewDate]: {
          ...metadata.orderDetail[currentViewDate],
          memberOrders: newMemberOrders,
        },
      },
    };

    await addUpdateMemberOrder(orderId, updateParams);
    await dispatch(loadData(orderId));
  },
);

const addParticipant = createAsyncThunk(
  'app/OrderManagement/ADD_PARTICIPANT',
  async (params: TObject, { getState, dispatch, rejectWithValue }) => {
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

    const response = await addParticipantToOrderApi(orderId, bodyParams);
    const { data } = response || {};

    if (data?.errorCode) {
      return rejectWithValue(data?.message);
    }

    await dispatch(loadData(orderId));

    return {};
  },
);

const deleteParticipant = createAsyncThunk(
  'app/OrderManagement/DELETE_PARTICIPANT',
  async (params: TObject, { getState, dispatch, rejectWithValue }) => {
    try {
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
              memberOrders: omit(memberOrders, [participantId]),
            },
          };
        },
        {},
      );

      const bodyParams = {
        participantId,
        participants: participants.filter(
          (pId: string) => pId !== participantId,
        ),
        newOrderDetail,
        planId,
      };

      await deleteParticipantFromOrderApi(orderId, bodyParams);
      await dispatch(loadData(orderId));
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

const bookerStartOrder = createAsyncThunk(
  'app/OrderManagement/startOrder',
  async ({ orderId, foodOrderGroupedByDate }: TObject, { getState }) => {
    const { plans, companyId } = Listing(
      getState().OrderManagement.orderData! as TListing,
    ).getMetadata();

    await bookerStartOrderApi({
      orderId,
      planId: plans.length > 0 ? plans[0] : '',
    });

    const clientQuotation = {
      quotation: foodOrderGroupedByDate.reduce((result: any, item: any) => {
        return {
          ...result,
          [item.date]: item.foodDataList,
        };
      }, {}),
    };

    const groupByRestaurantQuotationData = groupBy(
      foodOrderGroupedByDate,
      'restaurantId',
    );

    const partnerQuotation = Object.keys(groupByRestaurantQuotationData).reduce(
      (result, item) => {
        return {
          ...result,
          [item]: {
            name: groupByRestaurantQuotationData[item][0].restaurantName,
            quotation: groupByRestaurantQuotationData[item].reduce(
              (quotationArrayResult: any, quotationItem: any) => {
                return {
                  ...quotationArrayResult,
                  [quotationItem.date]: quotationItem.foodDataList,
                };
              },
              {},
            ),
          },
        };
      },
      {},
    );

    const apiBody = {
      orderId,
      companyId,
      partner: partnerQuotation,
      client: clientQuotation,
    };

    await createQuotationApi(orderId, apiBody);
  },
);

const cancelPickingOrder = createAsyncThunk(
  'app/OrderManagement/CANCEL_PICKING_ORDER',
  async (orderId: string) => {
    await cancelPickingOrderApi(orderId);
  },
  {
    serializeError: storableError,
  },
);

const bookerMarkInprogressPlanViewed = createAsyncThunk(
  'app/OrderManagement/BOOKER_MARK_INPROGRESS_PLAN_VIEWED',
  async ({ orderId, planId }: { orderId: string; planId: string }) => {
    await bookerMarkInprogressPlanViewedApi({ orderId, planId });
  },
);

export const orderManagementThunks = {
  loadData,
  updateOrderGeneralInfo,
  addOrUpdateMemberOrder,
  sendRemindEmailToMember,
  disallowMember,
  restoredDisAllowedMember,
  deleteDisAllowedMember,
  addParticipant,
  deleteParticipant,
  bookerStartOrder,
  cancelPickingOrder,
  bookerMarkInprogressPlanViewed,
};

// ================ Slice ================ //
const OrderManagementSlice = createSlice({
  name: 'OrderManagement',
  initialState,
  reducers: {
    clearOrderData: (state) => {
      return {
        ...state,
        companyId: null,
        companyData: null,
        orderData: {},
        planData: {},
        bookerData: null,
        participantData: [],
        anonymousParticipantData: [],
        transactionDataMap: {},
        isFetchingOrderDetails: false,
      };
    },
  },
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
      })
      /* =============== startPickingOrder =============== */
      .addCase(bookerStartOrder.pending, (state) => {
        state.isStartOrderInProgress = true;
      })
      .addCase(bookerStartOrder.fulfilled, (state) => {
        state.isStartOrderInProgress = false;
      })
      .addCase(bookerStartOrder.rejected, (state) => {
        state.isStartOrderInProgress = false;
      })
      /* =============== cancelPickingOrder =============== */
      .addCase(cancelPickingOrder.pending, (state) => ({
        ...state,
        cancelPickingOrderInProgress: true,
        cancelPickingOrderError: null,
      }))
      .addCase(cancelPickingOrder.fulfilled, (state) => ({
        ...state,
        cancelPickingOrderInProgress: false,
      }))
      .addCase(cancelPickingOrder.rejected, (state, { payload }) => ({
        ...state,
        cancelPickingOrderInProgress: false,
        cancelPickingOrderError: payload,
      }))
      /* =============== addParticipant =============== */
      .addCase(addParticipant.pending, (state) => {
        state.updateParticipantsInProgress = true;
        state.updateParticipantsError = null;
      })
      .addCase(addParticipant.fulfilled, (state) => {
        state.updateParticipantsInProgress = false;
      })
      .addCase(addParticipant.rejected, (state, { payload }) => {
        state.updateParticipantsInProgress = false;
        state.updateParticipantsError = payload;
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
      /* =============== addOrUpdateMemberOrder =============== */
      .addCase(addOrUpdateMemberOrder.pending, (state) => {
        state.addOrUpdateMemberOrderError = null;
        state.addOrUpdateMemberOrderInProgress = true;
      })
      .addCase(addOrUpdateMemberOrder.fulfilled, (state) => {
        state.addOrUpdateMemberOrderInProgress = false;
      })
      .addCase(addOrUpdateMemberOrder.rejected, (state) => {
        state.addOrUpdateMemberOrderInProgress = false;
      })
      /* =============== bookerMarkInprogressPlanViewed =============== */
      .addCase(bookerMarkInprogressPlanViewed.pending, (state) => {
        return state;
      })
      .addCase(bookerMarkInprogressPlanViewed.fulfilled, (state) => {
        state.planViewed = true;
      })
      .addCase(bookerMarkInprogressPlanViewed.rejected, (state) => {
        return state;
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
  } = state.OrderManagement;

  return (
    isFetchingOrderDetails || isDeletingParticipant || isUpdatingOrderDetails
  );
};
