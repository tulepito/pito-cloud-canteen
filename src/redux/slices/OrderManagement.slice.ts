import { createSlice } from '@reduxjs/toolkit';
import groupBy from 'lodash/groupBy';
import omit from 'lodash/omit';

import {
  createOrderChangesHistoryDocumentApi,
  participantSubOrderAddDocumentApi,
  participantSubOrderGetByIdApi,
  participantSubOrderUpdateDocumentApi,
  queryOrderChangesHistoryDocumentApi,
} from '@apis/firebaseApi';
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
  updatePlanDetailsApi,
} from '@apis/orderApi';
import { createAsyncThunk } from '@redux/redux.helper';
import type { RootState } from '@redux/store';
import type { TPlan } from '@src/utils/orderTypes';
import { Listing } from '@utils/data';
import { EOrderHistoryTypes, EParticipantOrderStatus } from '@utils/enums';
import { storableError } from '@utils/errors';
import type {
  TCompany,
  TListing,
  TObject,
  TSubOrderChangeHistoryItem,
  TTransaction,
  TUser,
} from '@utils/types';

export const QUERY_SUB_ORDER_CHANGES_HISTORY_PER_PAGE = 3;

const addNewMemberToOrderDetail = (
  orderDetail: TPlan['orderDetail'],
  date: number,
  memberId: string,
  memberData: TObject,
) => {
  const newOrderDetail = {
    ...orderDetail,
    [date]: {
      ...orderDetail[date],
      memberOrders: {
        ...orderDetail[date].memberOrders,
        [memberId]: memberData,
      },
    },
  };

  return newOrderDetail;
};

const prepareOrderDetail = ({
  orderDetail,
  currentViewDate,
  foodId,
  memberId,
  requirement,
}: {
  orderDetail: TPlan['orderDetail'];
  currentViewDate: number;
  foodId: string;
  memberId: string;
  requirement: string;
}) => {
  const memberOrderDetailOnUpdateDate =
    orderDetail[currentViewDate.toString()].memberOrders[memberId];
  const { status = EParticipantOrderStatus.empty } =
    memberOrderDetailOnUpdateDate || {};
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

  const newOrderDetail = addNewMemberToOrderDetail(
    orderDetail,
    currentViewDate,
    memberId,
    newMemberOrderValues,
  );

  return newOrderDetail as TPlan['orderDetail'];
};

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

  subOrderChangesHistory: TSubOrderChangeHistoryItem[];
  querySubOrderChangesHistoryInProgress: boolean;
  loadMoreSubOrderChangesHistory: boolean;
  querySubOrderChangesHistoryError: any;
  lastRecordSubOrderChangesHistoryCreatedAt: number | null;
  subOrderChangesHistoryTotalItems: number;
  draftSubOrderChangesHistory: Record<string, TSubOrderChangeHistoryItem[]>;

  orderDetail: TPlan['orderDetail'];
  updateOrderFromDraftEditInProgress: boolean;
  updateOrderfromDraftEditError: any;
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
  orderDetail: {},
  planViewed: false,
  bookerData: null,
  participantData: [],
  anonymousParticipantData: [],
  transactionDataMap: {},
  subOrderChangesHistory: [],
  querySubOrderChangesHistoryInProgress: false,
  querySubOrderChangesHistoryError: null,
  lastRecordSubOrderChangesHistoryCreatedAt: null,
  subOrderChangesHistoryTotalItems: 0,
  loadMoreSubOrderChangesHistory: false,
  updateOrderFromDraftEditInProgress: false,
  updateOrderfromDraftEditError: null,
  draftSubOrderChangesHistory: {},
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
  async (params: TObject, { getState, dispatch, rejectWithValue }) => {
    const { currentViewDate, foodId, memberId, requirement, memberEmail } =
      params;
    const orderGetter = Listing(
      getState().OrderManagement.orderData! as TListing,
    );
    const orderId = orderGetter.getId();
    const { participants = [], anonymous = [] } = orderGetter.getMetadata();
    const {
      id: { uuid: planId },
      attributes: { metadata = {} },
    } = getState().OrderManagement.planData!;

    const newOrderDetail = prepareOrderDetail({
      orderDetail: metadata.orderDetail,
      currentViewDate,
      foodId,
      memberId,
      requirement,
    });

    const updateParams = {
      planId,
      orderDetail: newOrderDetail,
    };

    await addUpdateMemberOrder(orderId, updateParams);

    const subOrderId = `${memberId} - ${planId} - ${currentViewDate}`;
    const { data: firebaseSubOrderDocument } =
      await participantSubOrderGetByIdApi(subOrderId);

    if (!firebaseSubOrderDocument) {
      await participantSubOrderAddDocumentApi({
        participantId,
        planId,
        timestamp: currentViewDate,
      });
    } else {
      await participantSubOrderUpdateDocumentApi({
        subOrderId,
        params: {
          foodId,
        },
      });
    }
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
        metadata: { participants = [], anonymous = [] },
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
      anonymous,
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

    // Function is not ready on production

    // await sendPartnerNewOrderAppearEmailApi(orderId, {
    //   orderId,
    //   partner: partnerQuotation,
    // });
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

const updatePlanOrderDetail = createAsyncThunk(
  'app/OrderManagement/UPDATE_PLAN_ORDER_DETAIL',
  async (
    {
      orderId,
      planId,
      orderDetail,
    }: { orderId: string; planId: string; orderDetail: TObject },
    { fulfillWithValue, rejectWithValue },
  ) => {
    try {
      updatePlanDetailsApi(orderId, {
        orderDetail,
        planId,
      });

      return fulfillWithValue(orderDetail);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);
const querySubOrderChangesHistory = createAsyncThunk(
  'app/OrderManagement/QUERY_SUB_ORDER_CHANGES_HISTORY',
  async ({
    orderId,
    planId,
    planOrderDate,
    lastRecordCreatedAt,
  }: {
    orderId: string;
    planId: string;
    planOrderDate: number;
    lastRecordCreatedAt?: number;
  }) => {
    const { data } = await queryOrderChangesHistoryDocumentApi(
      orderId,
      planId,
      {
        planOrderDate,
        lastRecordCreatedAt,
      },
    );

    return data;
  },
);

const updateOrderFromDraftEdit = createAsyncThunk(
  'app/OrderManagement/UPDATE_ORDER_FROM_DRAFT_EDIT',
  async (_, { getState, dispatch }) => {
    const {
      id: { uuid: orderId },
    } = getState().OrderManagement.orderData!;
    const {
      id: { uuid: planId },
    } = getState().OrderManagement.planData!;
    const { draftSubOrderChangesHistory } = getState().OrderManagement;
    const { orderDetail } = getState().OrderManagement;
    const updateParams = {
      planId,
      orderDetail,
    };
    await addUpdateMemberOrder(orderId, updateParams);
    await Promise.all(
      Object.keys(draftSubOrderChangesHistory).map(async (date) => {
        const draftSubOrderChangesHistoryByDate = draftSubOrderChangesHistory[
          date as keyof typeof draftSubOrderChangesHistory
        ] as TSubOrderChangeHistoryItem[];
        await Promise.all(
          draftSubOrderChangesHistoryByDate.map(
            async (item: TSubOrderChangeHistoryItem) => {
              const {
                memberId,
                planOrderDate,
                type,
                oldValue,
                newValue,
                createdAt,
              } = item;
              const subOrderChangesHistoryParams = {
                planId,
                memberId,
                planOrderDate,
                type,
                oldValue,
                newValue,
                createdAt: new Date(Number(createdAt?.seconds) * 1000),
              };
              await createOrderChangesHistoryDocumentApi(
                orderId,
                subOrderChangesHistoryParams,
              );
            },
          ),
        );
      }),
    );
    await dispatch(loadData(orderId));
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
  updatePlanOrderDetail,
  querySubOrderChangesHistory,
  updateOrderFromDraftEdit,
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
    clearAddUpdateParticipantError: (state) => {
      state.addOrUpdateMemberOrderError = null;
    },
    updateStaffName: (state, { payload }) => {
      state.orderData!.attributes.metadata.staffName = payload;
    },
    updateDraftOrderDetail: (state, { payload }) => {
      const { currentViewDate, foodId, memberId, memberEmail, requirement } =
        payload;

      const { orderDetail, draftSubOrderChangesHistory } = state;
      const memberOrderBeforeUpdate =
        orderDetail[currentViewDate].memberOrders[memberId];

      const { foodId: oldFoodId } = memberOrderBeforeUpdate || {};

      const newOrderDetail = prepareOrderDetail({
        orderDetail,
        currentViewDate,
        foodId,
        memberId,
        requirement,
      });

      const { foodList = {} } =
        newOrderDetail[currentViewDate]?.restaurant || {};

      const { foodName: oldFoodName, foodPrice: oldFoodPrice } =
        foodList[oldFoodId] || {};

      const { foodName: newFooldName, foodPrice: newFoodPrice } =
        foodList[foodId] || {};

      const newDraftSubOrderChangesHistory = {
        ...draftSubOrderChangesHistory,
        [currentViewDate]: [
          {
            id: new Date().getTime(),
            memberId,
            member: {
              email: memberEmail,
            },
            createdAt: {
              // Fake a Firestore time object
              seconds: new Date().getTime() / 1000,
            },
            planOrderDate: currentViewDate,
            type: oldFoodId
              ? EOrderHistoryTypes.MEMBER_FOOD_CHANGED
              : EOrderHistoryTypes.MEMBER_FOOD_ADDED,
            oldValue: oldFoodId
              ? {
                  foodId: oldFoodId,
                  foodName: oldFoodName,
                  foodPrice: oldFoodPrice,
                }
              : null,
            newValue: {
              foodId,
              foodName: newFooldName,
              foodPrice: newFoodPrice,
            },
          },
          ...(draftSubOrderChangesHistory[currentViewDate] || []),
        ],
      };

      return {
        ...state,
        orderDetail: newOrderDetail,
        draftSubOrderChangesHistory: newDraftSubOrderChangesHistory,
      };
    },
    draftDisallowMember: (state, { payload }) => {
      const { currentViewDate, memberId, memberEmail } = payload;
      const { orderDetail } = state;
      const memberOrderDetailOnUpdateDate =
        orderDetail[currentViewDate].memberOrders[memberId];
      const { status } = memberOrderDetailOnUpdateDate;

      const validStatuses = [
        EParticipantOrderStatus.notJoined,
        EParticipantOrderStatus.expired,
      ];

      if (validStatuses.includes(status)) {
        return { ...state };
      }

      const newMemberOrderValues = {
        ...memberOrderDetailOnUpdateDate,
        status: EParticipantOrderStatus.notAllowed,
      };

      const memberOrderBeforeUpdate =
        orderDetail[currentViewDate].memberOrders[memberId];

      const { foodId: oldFoodId } = memberOrderBeforeUpdate || {};

      const newOrderDetail = addNewMemberToOrderDetail(
        orderDetail,
        currentViewDate,
        memberId,
        newMemberOrderValues,
      );

      const { foodList = {} } = orderDetail[currentViewDate].restaurant;

      const { foodName: oldFoodName, foodPrice: oldFoodPrice } =
        foodList[oldFoodId] || {};

      const newDraftSubOrderChangesHistory = {
        ...state.draftSubOrderChangesHistory,
        [currentViewDate]: [
          {
            memberId,
            member: {
              email: memberEmail,
            },
            createdAt: {
              // Fake a Firestore time object
              seconds: new Date().getTime() / 1000,
            },
            planOrderDate: currentViewDate,
            type: EOrderHistoryTypes.MEMBER_FOOD_REMOVED,
            newValue: null,
            oldValue: {
              foodName: oldFoodName,
              foodPrice: oldFoodPrice,
              foodId: oldFoodId,
            },
          },
          ...(state.draftSubOrderChangesHistory[currentViewDate] || []),
        ],
      };

      return {
        ...state,
        orderDetail: newOrderDetail,
        draftSubOrderChangesHistory: newDraftSubOrderChangesHistory,
      };
    },
    setDraftOrderDetails: (state, { payload }) => {
      return {
        ...state,
        orderDetail: payload,
      };
    },
    updateDraftSubOrderChangesHistory: (state, { payload }) => {
      const {
        currentViewDate,
        foodName,
        foodPrice,
        quantity: newQuantity,
        foodId,
      } = payload;
      const { planData } = state;
      const planDataGetter = Listing(planData as TListing);

      const { orderDetail = {} } = planDataGetter.getMetadata();

      const { lineItems } = orderDetail[currentViewDate] || {};
      const itemIndex = lineItems.findIndex((x: TObject) => x?.id === foodId);
      const { quantity: defaultQuantity = 0 } = lineItems[itemIndex] || {};

      const currentDraftSubOrderChanges = [
        ...(state.draftSubOrderChangesHistory[currentViewDate] || []),
      ];

      const index = currentDraftSubOrderChanges.findIndex(
        (i) => i?.newValue?.foodId === foodId || i?.oldValue?.foodId === foodId,
      );

      if (index > -1) {
        if (newQuantity === defaultQuantity) {
          currentDraftSubOrderChanges.splice(index, 1);

          return {
            ...state,
            draftSubOrderChangesHistory: {
              ...state.draftSubOrderChangesHistory,
              [currentViewDate]: currentDraftSubOrderChanges,
            },
          };
        }

        if (newQuantity === 0) {
          const newSubOrderChangesItem = {
            // fake document id
            id: new Date().getTime(),
            createdAt: {
              // fake a draft Firestore date object
              seconds: new Date().getTime() / 1000,
            },
            type: EOrderHistoryTypes.FOOD_REMOVED,
            oldValue: {
              foodName,
              foodPrice,
              foodId,
              quantity: defaultQuantity,
            },
            newValue: null,
            planOrderDate: currentViewDate,
          };

          currentDraftSubOrderChanges[index] = newSubOrderChangesItem;

          const newDraftSubOrderChangesHistory = {
            ...state.draftSubOrderChangesHistory,
            [currentViewDate]: currentDraftSubOrderChanges,
          };

          return {
            ...state,
            draftSubOrderChangesHistory: newDraftSubOrderChangesHistory,
          };
        }

        const newSubOrderChangesItem = {
          // fake document id
          id: new Date().getTime(),
          createdAt: {
            // fake a draft Firestore date object
            seconds: new Date().getTime() / 1000,
          },
          type:
            newQuantity < defaultQuantity
              ? EOrderHistoryTypes.FOOD_DECREASED
              : EOrderHistoryTypes.FOOD_INCREASED,
          oldValue: {
            foodName,
            foodPrice,
            foodId,
            quantity: defaultQuantity,
          },
          newValue: {
            foodName,
            foodPrice,
            foodId,
            quantity: newQuantity,
          },
          planOrderDate: currentViewDate,
        };

        currentDraftSubOrderChanges[index] = newSubOrderChangesItem;

        const newDraftSubOrderChangesHistory = {
          ...state.draftSubOrderChangesHistory,
          [currentViewDate]: currentDraftSubOrderChanges,
        };

        return {
          ...state,
          draftSubOrderChangesHistory: newDraftSubOrderChangesHistory,
        };
      }

      const newSubOrderChangesItem = {
        // fake document id
        id: new Date().getTime(),
        createdAt: {
          // fake a draft Firestore date object
          seconds: new Date().getTime() / 1000,
        },
        type:
          newQuantity < defaultQuantity
            ? EOrderHistoryTypes.FOOD_DECREASED
            : EOrderHistoryTypes.FOOD_INCREASED,
        oldValue: {
          foodName,
          foodPrice,
          foodId,
          quantity: defaultQuantity,
        },
        newValue: {
          foodName,
          foodPrice,
          foodId,
          quantity: newQuantity,
        },
        planOrderDate: currentViewDate,
      };

      const newDraftSubOrderChangesHistory = {
        ...state.draftSubOrderChangesHistory,
        [currentViewDate]: [
          newSubOrderChangesItem,
          ...currentDraftSubOrderChanges,
        ],
      };

      return {
        ...state,
        draftSubOrderChangesHistory: newDraftSubOrderChangesHistory,
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

        const { orderDetail } = Listing(planData).getMetadata();

        return {
          ...state,
          isFetchingOrderDetails: false,
          orderData,
          planData,
          orderDetail,
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
      .addCase(addOrUpdateMemberOrder.rejected, (state, { payload }) => {
        state.addOrUpdateMemberOrderInProgress = false;
        state.addOrUpdateMemberOrderError = payload;
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
      })
      /* =============== updatePlanOrderDetail =============== */
      .addCase(updatePlanOrderDetail.pending, (state) => {
        state.isUpdatingOrderDetails = true;
      })
      .addCase(updatePlanOrderDetail.fulfilled, (state, { payload }) => {
        state.isUpdatingOrderDetails = false;
        state.planData.attributes.metadata = {
          ...state.planData.attributes.metadata,
          orderDetail: {
            ...payload,
          },
        };
      })
      .addCase(updatePlanOrderDetail.rejected, (state) => {
        state.isUpdatingOrderDetails = false;
      })
      .addCase(
        querySubOrderChangesHistory.pending,
        (state, { meta: { arg } }) => {
          const { lastRecordCreatedAt } = arg;
          state.querySubOrderChangesHistoryError = null;

          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          lastRecordCreatedAt
            ? (state.loadMoreSubOrderChangesHistory = true)
            : (state.querySubOrderChangesHistoryInProgress = true);
        },
      )
      .addCase(
        querySubOrderChangesHistory.fulfilled,
        (state, { payload, meta: { arg } }) => {
          const { lastRecordCreatedAt } = arg;
          const { data: items, totalItems } = payload;
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          lastRecordCreatedAt
            ? (state.loadMoreSubOrderChangesHistory = false)
            : (state.querySubOrderChangesHistoryInProgress = false);
          state.subOrderChangesHistory = lastRecordCreatedAt
            ? [...state.subOrderChangesHistory, ...items]
            : items;
          state.subOrderChangesHistoryTotalItems = totalItems;
          state.lastRecordSubOrderChangesHistoryCreatedAt =
            // eslint-disable-next-line no-unsafe-optional-chaining
            items?.[items.length - 1]?.createdAt?.seconds;
        },
      )
      .addCase(
        querySubOrderChangesHistory.rejected,
        (state, { error, meta: { arg } }) => {
          const { lastRecordCreatedAt } = arg;
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          lastRecordCreatedAt
            ? (state.loadMoreSubOrderChangesHistory = false)
            : (state.querySubOrderChangesHistoryInProgress = false);
          state.querySubOrderChangesHistoryError = error;
        },
      )
      .addCase(updateOrderFromDraftEdit.pending, (state) => {
        state.updateOrderFromDraftEditInProgress = true;
        state.updateOrderfromDraftEditError = null;
      })
      .addCase(updateOrderFromDraftEdit.fulfilled, (state) => {
        state.updateOrderFromDraftEditInProgress = false;
      })
      .addCase(updateOrderFromDraftEdit.rejected, (state, { error }) => {
        state.updateOrderFromDraftEditInProgress = false;
        state.updateOrderfromDraftEditError = error;
      })

      /* =============== updatePlanOrderDetail =============== */
      .addCase(updatePlanOrderDetail.pending, (state) => {
        state.isUpdatingOrderDetails = true;
      })
      .addCase(updatePlanOrderDetail.fulfilled, (state, { payload }) => {
        state.isUpdatingOrderDetails = false;
        state.planData.attributes.metadata = {
          ...state.planData.attributes.metadata,
          orderDetail: {
            ...payload,
          },
        };
      })
      .addCase(updatePlanOrderDetail.rejected, (state) => {
        state.isUpdatingOrderDetails = false;
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
