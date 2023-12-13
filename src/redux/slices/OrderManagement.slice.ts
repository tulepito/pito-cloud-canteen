/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/no-shadow */
import { createSlice } from '@reduxjs/toolkit';
import groupBy from 'lodash/groupBy';
import isEmpty from 'lodash/isEmpty';
import omit from 'lodash/omit';
import set from 'lodash/set';
import uniq from 'lodash/uniq';

import {
  createSubOrderChangesHistoryDocumentApi,
  participantSubOrderAddDocumentApi,
  participantSubOrderGetByIdApi,
  participantSubOrderUpdateDocumentApi,
  queryOrderChangesHistoryDocumentApi,
} from '@apis/firebaseApi';
import { createNotificationApi } from '@apis/notificationApi';
import {
  addParticipantToOrderApi,
  addUpdateMemberOrder,
  bookerStartOrderApi,
  cancelPickingOrderApi,
  createQuotationApi,
  deleteParticipantFromOrderApi,
  getBookerOrderDataApi,
  initializePaymentApi,
  sendOrderDetailUpdatedEmailApi,
  sendPartnerNewOrderAppearEmailApi,
  sendRemindEmailToMemberApi,
  updateOrderApi,
  updateOrderDetailFromDraftApi,
  updatePaymentApi,
  updatePlanDetailsApi,
} from '@apis/orderApi';
import { fetchTxApi } from '@apis/txApi';
import { checkUserExistedApi } from '@apis/userApi';
import { EOrderDetailsTableTab } from '@components/OrderDetails/EditView/ManageOrderDetailSection/OrderDetailsTable/OrderDetailsTable.utils';
import { checkMinMaxQuantityInProgressState } from '@helpers/order/orderInProgressHelper';
import {
  calculateClientQuotation,
  calculatePartnerQuotation,
} from '@helpers/order/quotationHelper';
import { AdminManageOrderActions } from '@pages/admin/order/AdminManageOrder.slice';
import { createAsyncThunk } from '@redux/redux.helper';
import type { RootState } from '@redux/store';
import type { NotificationInvitationParams } from '@services/notifications';
import type { TPlan } from '@src/utils/orderTypes';
import { denormalisedResponseEntities, Listing, User } from '@utils/data';
import {
  EEditSubOrderHistoryType,
  ENotificationType,
  EParticipantOrderStatus,
} from '@utils/enums';
import { EHttpStatusCode, storableError } from '@utils/errors';
import type {
  TCompany,
  TListing,
  TObject,
  TSubOrderChangeHistoryItem,
  TTransaction,
  TUser,
} from '@utils/types';

import { setOrderDetail } from './Order.slice';
import { SystemAttributesThunks } from './systemAttributes.slice';

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

export const prepareOrderDetail = ({
  orderDetail,
  currentViewDate,
  foodId,
  memberId,
  requirement,
  memberOrderValues,
}: {
  orderDetail: TPlan['orderDetail'];
  currentViewDate: number;
  foodId: string;
  memberId: string;
  requirement: string;
  memberOrderValues: TObject;
}) => {
  let newMemberOrderValues = memberOrderValues;

  const { status = EParticipantOrderStatus.empty } = memberOrderValues || {};

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
  fetchOrderInProgress: boolean;
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
  // transactions
  queryTransactionsInProgress: boolean;
  transactionMap: TObject<string, TTransaction>;

  isStartOrderInProgress: boolean;
  // Data states
  companyId: string | null;
  companyData: TCompany | null;
  orderData: TObject | null;
  planData: TObject;
  bookerData: TUser | null;
  participantData: Array<TUser>;
  anonymousParticipantData: Array<TUser>;
  restaurantData: TObject[];
  subOrderChangesHistory: TSubOrderChangeHistoryItem[];
  querySubOrderChangesHistoryInProgress: boolean;
  loadMoreSubOrderChangesHistory: boolean;
  querySubOrderChangesHistoryError: any;
  lastRecordSubOrderChangesHistoryCreatedAt: number | null;
  subOrderChangesHistoryTotalItems: number;
  draftSubOrderChangesHistory: Record<string, TSubOrderChangeHistoryItem[]>;

  updateOrderFromDraftEditInProgress: boolean;
  updateOrderFromDraftEditError: any;

  draftOrderDetail: TPlan['orderDetail'];
  quotation: TObject;
  fetchQuotationInProgress: boolean;
  fetchQuotationError: any;

  shouldShowUnderError: boolean;
  shouldShowOverflowError: boolean;
  orderValidationsInProgressState: {
    planValidationsInProgressState: Record<
      number,
      {
        planReachMinRestaurantQuantity: boolean;
        planReachMaxRestaurantQuantity: boolean;
        planReachMaxCanModify: boolean;
      }
    >;
    orderReachMaxRestaurantQuantity: boolean;
    orderReachMinRestaurantQuantity: boolean;
    orderReachMaxCanModify: boolean;
  } | null;
  isAdminFlow: boolean;
};

const initialState: TOrderManagementState = {
  fetchOrderInProgress: false,
  isDeletingParticipant: false,
  isUpdatingOrderDetails: false,
  isSendingRemindEmail: false,
  cancelPickingOrderInProgress: false,
  cancelPickingOrderError: null,
  updateParticipantsInProgress: false,
  updateParticipantsError: null,
  addOrUpdateMemberOrderInProgress: false,
  addOrUpdateMemberOrderError: null,
  queryTransactionsInProgress: false,
  transactionMap: {},
  isStartOrderInProgress: false,
  companyId: null,
  companyData: null,
  orderData: {},
  planData: {},
  draftOrderDetail: {},
  bookerData: null,
  participantData: [],
  anonymousParticipantData: [],
  restaurantData: [],
  subOrderChangesHistory: [],
  querySubOrderChangesHistoryInProgress: false,
  querySubOrderChangesHistoryError: null,
  lastRecordSubOrderChangesHistoryCreatedAt: null,
  subOrderChangesHistoryTotalItems: 0,
  loadMoreSubOrderChangesHistory: false,
  updateOrderFromDraftEditInProgress: false,
  updateOrderFromDraftEditError: null,
  draftSubOrderChangesHistory: {},
  orderValidationsInProgressState: null,
  shouldShowUnderError: false,
  shouldShowOverflowError: false,
  quotation: {},
  fetchQuotationInProgress: false,
  fetchQuotationError: null,
  isAdminFlow: false,
};

// ================ Thunk types ================ //
const FETCH_QUOTATION = 'app/OrderManagement/FETCH_QUOTATION';

// ================ Async thunks ================ //
const queryTransactions = createAsyncThunk(
  'app/OrderManagement/QUERY_TRANSACTIONS',
  async (payload: { orderDetail: TObject }) => {
    const { orderDetail } = payload;
    const transactionMap: TObject = {};

    await Promise.all(
      Object.entries(orderDetail).map(async (entry) => {
        const [subOrderDate, subOrderDateData] = entry;
        const { transactionId } = (subOrderDateData as TObject) || {};

        if (transactionId) {
          const txResponse = await fetchTxApi(transactionId);

          transactionMap[subOrderDate as string] = txResponse.data;
        }
      }),
    );

    return transactionMap;
  },
);

const loadData = createAsyncThunk(
  'app/OrderManagement/LOAD_DATA',
  async (payload: { orderId: string; isAdminFlow?: boolean }, { dispatch }) => {
    const { orderId, isAdminFlow = false } = payload;
    const response: any = await getBookerOrderDataApi(orderId);
    dispatch(SystemAttributesThunks.fetchVATPercentageByOrderId(orderId));

    if (isAdminFlow) {
      const { orderListing: orderData = {}, planListing: planData = {} } =
        response.data || {};

      const { orderDetail = {} } = Listing(planData).getMetadata();

      dispatch(queryTransactions({ orderDetail }));
      dispatch(AdminManageOrderActions.saveOrder(orderData));
      dispatch(AdminManageOrderActions.saveOrderDetail(orderDetail));
    }

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
    const { skipFetchData = false, ...restParams } = params;

    const updateParams = {
      generalInfo: {
        ...restParams,
      },
    };

    await updateOrderApi(orderId, updateParams);
    if (skipFetchData) {
      return restParams;
    }
    await dispatch(
      loadData({
        orderId,
        isAdminFlow: getState().OrderManagement.isAdminFlow,
      }),
    );

    return {};
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
        metadata: { orderDetail = {} },
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

    await sendRemindEmailToMemberApi(orderId, {
      orderLink,
      deadline,
      description,
      uniqueMemberIdList: uniq(memberIdList),
    });
  },
);

const addOrUpdateMemberOrder = createAsyncThunk(
  'app/OrderManagement/ADD_OR_UPDATE_MEMBER_ORDER',
  async (params: TObject, { getState, rejectWithValue }) => {
    try {
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

      let shouldUpdateAnonymousList = false;
      let updateAnonymous = anonymous;

      // TODO: check existed user or not
      const checkUserResult = await checkUserExistedApi({
        ...(memberId ? { id: memberId } : {}),
        ...(memberEmail ? { email: memberEmail } : {}),
      });

      let participantId = memberId;

      const { status: apiStatus = EHttpStatusCode.NotFound, user } =
        checkUserResult?.data || {};

      if (apiStatus === EHttpStatusCode.NotFound) {
        return rejectWithValue('user_not_found');
      }

      if (!isEmpty(user)) {
        participantId = User(user).getId();
      }
      // TODO: Update list anonymous
      if (
        !participants.includes(participantId) &&
        !anonymous.includes(participantId) &&
        participantId
      ) {
        shouldUpdateAnonymousList = true;
        updateAnonymous = anonymous.concat(participantId);
      }

      const memberOrderDetailOnUpdateDate =
        metadata?.orderDetail[currentViewDate.toString()].memberOrders[
          memberId
        ];
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

      const updateParams = {
        currentViewDate,
        participantId,
        planId,
        newMemberOrderValues,
        ...(shouldUpdateAnonymousList ? { anonymous: updateAnonymous } : {}),
      };

      const { data: updatePlanListing } = await addUpdateMemberOrder(
        orderId,
        updateParams,
      );
      const subOrderId = `${participantId} - ${planId} - ${currentViewDate}`;

      const addDocumentMemberSuborder = async () => {
        const { data: firebaseSubOrderDocument } =
          await participantSubOrderGetByIdApi(subOrderId);

        if (!firebaseSubOrderDocument) {
          participantSubOrderAddDocumentApi({
            participantId,
            planId,
            timestamp: currentViewDate,
          });
        } else {
          participantSubOrderUpdateDocumentApi({
            subOrderId,
            params: {
              foodId,
            },
          });
        }
      };
      // dont need to wait this line
      addDocumentMemberSuborder();

      const planListing = Listing(updatePlanListing.planListing);
      const { orderDetail = {} } = planListing.getMetadata();

      return {
        planData: updatePlanListing.planListing,
        orderDetail,
        newUser: user,
        anonymous: updateAnonymous,
      };
    } catch (error) {
      console.log(error);
    }
  },
);

const disallowMember = createAsyncThunk(
  'app/OrderManagement/DISALLOW_MEMBER',
  async (params: TObject, { getState }) => {
    const { currentViewDate, memberId } = params;

    const {
      id: { uuid: orderId },
    } = getState().OrderManagement.orderData!;
    const {
      id: { uuid: planId },
      attributes: { metadata },
    } = getState().OrderManagement.planData!;

    const { memberOrders = {} } = metadata?.orderDetail[currentViewDate] || {};
    const memberOrderDetailOnUpdateDate = memberOrders?.[memberId];
    const { status } = memberOrders?.[memberId] || {};

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
      currentViewDate,
      participantId: memberId,
      planId,
      newMemberOrderValues,
    };

    await addUpdateMemberOrder(orderId, updateParams);

    return updateParams;
  },
);

const restoredDisAllowedMember = createAsyncThunk(
  'app/OrderManagement/RESTORE_DISALLOWED_MEMBER',
  async (params: TObject, { getState }) => {
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
        const { foodId } = memberOrderDetailOnUpdateDate || {};
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
      currentViewDate,
      planId,
      newMembersOrderValues: updateMemberOrders,
    };

    await addUpdateMemberOrder(orderId, updateParams);

    return updateParams;
  },
);

const deleteDisAllowedMember = createAsyncThunk(
  'app/OrderManagement/DELETE_DISALLOWED_MEMBER',
  async (params: TObject, { getState }) => {
    const { currentViewDate, memberIds = [] } = params;
    const {
      id: { uuid: orderId },
    } = getState().OrderManagement.orderData!;
    const {
      id: { uuid: planId },
      attributes: { metadata },
    } = getState().OrderManagement.planData!;

    const { memberOrders: oldMemberOrders = {} } =
      metadata?.orderDetail[currentViewDate] || {};
    const newMemberOrders = (memberIds as string[]).reduce<TObject>(
      (result, memberId) => {
        return omit(result, memberId);
      },
      oldMemberOrders,
    );
    const updateOrderDetail = {
      ...metadata.orderDetail,
      [currentViewDate]: {
        ...metadata.orderDetail[currentViewDate],
        memberOrders: newMemberOrders,
      },
    };

    const updateParams = {
      planId,
      orderDetail: updateOrderDetail,
    };

    await updateOrderDetailFromDraftApi(orderId, updateParams);

    return updateParams;
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
        metadata: { orderDetail = {} },
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

    await dispatch(
      loadData({
        orderId,
        isAdminFlow: getState().OrderManagement.isAdminFlow,
      }),
    );

    return {};
  },
);

const deleteParticipant = createAsyncThunk(
  'app/OrderManagement/DELETE_PARTICIPANT',
  async (params: TObject, { getState, rejectWithValue }) => {
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
          metadata: { orderDetail = {} },
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

      return bodyParams;
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
    const { data: response } = await createQuotationApi(orderId, apiBody);

    if (process.env.NEXT_PUBLIC_ALLOW_PARTNER_EMAIL_SEND === 'true') {
      await sendPartnerNewOrderAppearEmailApi(orderId, {
        orderId,
        partner: partnerQuotation,
      });
    }
    await initializePaymentApi(orderId, plans[0]);

    return response;
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
const updatePlanOrderDetail = createAsyncThunk(
  'app/OrderManagement/UPDATE_PLAN_ORDER_DETAIL',
  async (
    {
      orderId,
      planId,
      orderDetail,
    }: { orderId: string; planId: string; orderDetail: TObject },
    { fulfillWithValue, rejectWithValue, dispatch },
  ) => {
    try {
      updatePlanDetailsApi(orderId, {
        orderDetail,
        planId,
      });

      // sync the order detail to order reducer
      dispatch(setOrderDetail(orderDetail));

      return fulfillWithValue(orderDetail);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

const updateOrderFromDraftEdit = createAsyncThunk(
  'app/OrderManagement/UPDATE_ORDER_FROM_DRAFT_EDIT',
  async (foodOrderGroupedByDate: TObject[], { getState, dispatch }) => {
    const {
      companyId,
      orderData,
      planData,
      restaurantData = [],
      draftSubOrderChangesHistory,
      draftOrderDetail,
    } = getState().OrderManagement;
    const orderId = Listing(orderData as TListing).getId();
    const { title: orderTitle } = Listing(
      orderData as TListing,
    ).getAttributes();
    const { companyName = 'PCC' } = Listing(
      orderData as TListing,
    ).getMetadata();
    const planId = Listing(planData as TListing).getId();
    const { orderDetail = {} } = Listing(planData as TListing).getMetadata();
    const updateParams = {
      planId,
      orderDetail: draftOrderDetail,
    };

    await updateOrderDetailFromDraftApi(orderId, updateParams);
    await Promise.all(
      Object.keys(draftSubOrderChangesHistory).map(async (date) => {
        const draftSubOrderChangesHistoryByDate = draftSubOrderChangesHistory[
          date as keyof typeof draftSubOrderChangesHistory
        ] as TSubOrderChangeHistoryItem[];
        if (draftSubOrderChangesHistoryByDate.length > 0) {
          const { restaurant = {} } = draftOrderDetail[date] || {};

          if (process.env.NEXT_PUBLIC_ALLOW_PARTNER_EMAIL_SEND === 'true') {
            await sendOrderDetailUpdatedEmailApi({
              orderId,
              timestamp: date,
              restaurantId: restaurant.id!,
            });
          }

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
                await createSubOrderChangesHistoryDocumentApi(
                  orderId,
                  subOrderChangesHistoryParams,
                );
              },
            ),
          );
        }
      }),
    );

    const clientQuotation = calculateClientQuotation(foodOrderGroupedByDate);

    const groupByRestaurantQuotationData = groupBy(
      foodOrderGroupedByDate,
      'restaurantId',
    );

    const partnerQuotation = calculatePartnerQuotation(
      groupByRestaurantQuotationData,
    );

    const apiBody = {
      orderId,
      companyId: companyId!,
      partner: partnerQuotation,
      client: clientQuotation,
    };

    await createQuotationApi(orderId, apiBody);

    const updatedDateList = Object.keys(draftSubOrderChangesHistory).filter(
      (d, index, array) => array.indexOf(d) === index,
    );

    const createNotificationParams = updatedDateList.reduce(
      (
        rest: {
          type: ENotificationType;
          params: NotificationInvitationParams;
        }[],
        date: string,
      ) => {
        const { restaurant: restaurantFromOrder } =
          draftOrderDetail[date] || {};
        const restaurantId = restaurantFromOrder.id;
        const restaurant = restaurantData.find(
          (r) => r?.id?.uuid === restaurantId,
        );

        if (restaurant) {
          const author = restaurant.author || {};
          const userId = User(author).getId();
          const newParams = {
            type: ENotificationType.SUB_ORDER_UPDATED,
            params: {
              userId,
              orderId,
              planId,
              subOrderDate: Number(date),
              orderTitle,
              companyName,
              newOrderDetail: draftOrderDetail[date],
              oldOrderDetail: orderDetail[date],
            } as NotificationInvitationParams,
          };

          return rest.concat(newParams);
        }

        return rest;
      },
      [],
    );

    if (!isEmpty(createNotificationParams))
      createNotificationApi({
        notifications: createNotificationParams,
      });

    updatePaymentApi(orderId, planId);

    await dispatch(
      loadData({
        orderId,
        isAdminFlow: getState().OrderManagement.isAdminFlow,
      }),
    );
  },
);

const fetchQuotation = createAsyncThunk(
  FETCH_QUOTATION,
  async (quotationId: string, { extra: sdk }) => {
    const quotation = denormalisedResponseEntities(
      await sdk.listings.show({
        id: quotationId,
      }),
    )[0];

    return quotation;
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
  querySubOrderChangesHistory,
  updatePlanOrderDetail,
  fetchQuotation,
  updateOrderFromDraftEdit,
};

// ================ Slice ================ //
const OrderManagementSlice = createSlice({
  name: 'OrderManagement',
  initialState,
  reducers: {
    clearOrderData: () => {
      return {
        ...initialState,
      };
    },
    clearAddUpdateParticipantError: (state) => {
      state.addOrUpdateMemberOrderError = null;
    },
    updateStaffName: (state, { payload }) => {
      state.orderData!.attributes.metadata.staffName = payload;
    },
    resetOrderDetailValidation: (state) => {
      return {
        ...state,
        orderValidationsInProgressState: null,
      };
    },
    updateDraftOrderDetail: (state, { payload }) => {
      const {
        currentViewDate,
        foodId,
        memberId,
        memberEmail,
        requirement,
        isAdminFlow = false,
      } = payload;

      const {
        draftOrderDetail,
        planData,
        draftSubOrderChangesHistory,
        orderData,
      } = state;

      const { orderDetail: defaultOrderDetail = {} } = Listing(
        planData as TListing,
      ).getMetadata();

      const { foodId: defaultFoodId } =
        defaultOrderDetail[currentViewDate].memberOrders[memberId] || {};

      const memberOrderBeforeUpdate =
        draftOrderDetail[currentViewDate].memberOrders[memberId];

      const { foodId: oldFoodId } = memberOrderBeforeUpdate || {};

      const newOrderDetail =
        prepareOrderDetail({
          orderDetail: draftOrderDetail,
          currentViewDate,
          foodId,
          memberId,
          requirement,
          memberOrderValues: memberOrderBeforeUpdate,
        }) || {};

      const orderValidationsInProgressState =
        checkMinMaxQuantityInProgressState(
          orderData,
          newOrderDetail,
          defaultOrderDetail,
          isAdminFlow,
        );
      const { planValidationsInProgressState } =
        orderValidationsInProgressState;

      const {
        planReachMaxRestaurantQuantity,
        planReachMinRestaurantQuantity,
        planReachMaxCanModify,
      } =
        planValidationsInProgressState[
          currentViewDate as keyof typeof planValidationsInProgressState
        ] || {};

      const hasValidationError =
        planReachMaxRestaurantQuantity ||
        planReachMinRestaurantQuantity ||
        planReachMaxCanModify;

      if (!isAdminFlow && hasValidationError) {
        return {
          ...state,
          orderValidationsInProgressState,
        };
      }

      const currentDraftSubOrderChanges = [
        ...(draftSubOrderChangesHistory[currentViewDate] || []),
      ];

      const orderHistoryByMemberIndex = currentDraftSubOrderChanges.findIndex(
        (i) => i.memberId === memberId,
      );

      if (defaultFoodId === foodId && orderHistoryByMemberIndex > -1) {
        currentDraftSubOrderChanges.splice(orderHistoryByMemberIndex, 0);

        return {
          ...state,
          orderValidationsInProgressState,
          draftOrderDetail: newOrderDetail,
          draftSubOrderChangesHistory: {
            ...state.draftSubOrderChangesHistory,
            [currentViewDate]: currentDraftSubOrderChanges,
          },
        };
      }

      if (defaultFoodId === foodId && orderHistoryByMemberIndex > -1) {
        currentDraftSubOrderChanges.splice(orderHistoryByMemberIndex, 0);

        return {
          ...state,
          orderDetail: newOrderDetail,
          draftSubOrderChangesHistory: {
            ...state.draftSubOrderChangesHistory,
            [currentViewDate]: currentDraftSubOrderChanges,
          },
          orderValidationsInProgressState,
        };
      }

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
              ? EEditSubOrderHistoryType.MEMBER_FOOD_CHANGED
              : EEditSubOrderHistoryType.MEMBER_FOOD_ADDED,
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
        orderValidationsInProgressState,
        draftOrderDetail: newOrderDetail,
        draftSubOrderChangesHistory: newDraftSubOrderChangesHistory,
      };
    },
    draftDisallowMember: (state, { payload }) => {
      const {
        currentViewDate,
        memberId,
        memberEmail,
        tab,
        isAdminFlow = false,
      } = payload;
      const { draftOrderDetail, planData, orderData } = state;
      const { orderDetail: defaultOrderDetail = {} } = Listing(
        planData as TListing,
      ).getMetadata();

      const { status: defaultStatus } =
        defaultOrderDetail[currentViewDate].memberOrders[memberId] || {};
      const memberOrderDetailOnUpdateDate =
        draftOrderDetail[currentViewDate].memberOrders[memberId];

      const currentDraftSubOrderChanges = [
        ...(state.draftSubOrderChangesHistory[currentViewDate] || []),
      ];

      const orderHistoryByMemberIndex = currentDraftSubOrderChanges.findIndex(
        (i) => i.memberId === memberId,
      );

      const isNotAddedToChoseList =
        defaultStatus === EParticipantOrderStatus.empty ||
        defaultStatus === EParticipantOrderStatus.notJoined;

      const newMemberOrderValues = {
        ...memberOrderDetailOnUpdateDate,
        status:
          isNotAddedToChoseList && tab !== EOrderDetailsTableTab.notChoose
            ? defaultStatus
            : EParticipantOrderStatus.notAllowed,
      };

      const newOrderDetail = addNewMemberToOrderDetail(
        draftOrderDetail,
        currentViewDate,
        memberId,
        newMemberOrderValues,
      );

      const orderValidationsInProgressState =
        checkMinMaxQuantityInProgressState(
          orderData,
          newOrderDetail,
          defaultOrderDetail,
          isAdminFlow,
        );
      const { planValidationsInProgressState } =
        orderValidationsInProgressState;

      const {
        planReachMaxRestaurantQuantity,
        planReachMinRestaurantQuantity,
        planReachMaxCanModify,
      } =
        planValidationsInProgressState[
          currentViewDate as keyof typeof planValidationsInProgressState
        ] || {};

      const hasValidationError =
        planReachMaxRestaurantQuantity ||
        planReachMinRestaurantQuantity ||
        planReachMaxCanModify;

      if (!isAdminFlow && hasValidationError) {
        return {
          ...state,
          orderValidationsInProgressState,
        };
      }

      if (orderHistoryByMemberIndex > -1 && isNotAddedToChoseList) {
        currentDraftSubOrderChanges.splice(orderHistoryByMemberIndex, 1);
        const newDraftSubOrderChangesHistory = {
          ...state.draftSubOrderChangesHistory,
          [currentViewDate]: currentDraftSubOrderChanges,
        };

        return {
          ...state,
          orderValidationsInProgressState,
          draftOrderDetail: newOrderDetail,
          draftSubOrderChangesHistory: newDraftSubOrderChangesHistory,
        };
      }

      const memberOrderBeforeUpdate =
        draftOrderDetail[currentViewDate].memberOrders[memberId];

      const { foodId: oldFoodId } = memberOrderBeforeUpdate || {};

      const { foodList = {} } = draftOrderDetail[currentViewDate].restaurant;

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
            type: EEditSubOrderHistoryType.MEMBER_FOOD_REMOVED,
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
        orderValidationsInProgressState,
        draftOrderDetail: newOrderDetail,
        draftSubOrderChangesHistory: newDraftSubOrderChangesHistory,
      };
    },
    setDraftOrderDetails: (state, { payload }) => {
      return {
        ...state,
        orderValidationsInProgressState: null,
        draftOrderDetail: payload,
      };
    },
    setDraftOrderDetailsAndSubOrderChangeHistory: (state, { payload }) => {
      const {
        updateValues = {},
        newOrderDetail,
        isAdminFlow = false,
      } = payload;

      const {
        currentViewDate,
        foodName,
        foodPrice,
        quantity: newQuantity,
        foodId,
      } = updateValues;
      const { planData, orderData } = state;
      const planDataGetter = Listing(planData as TListing);

      const { orderDetail = {} } = planDataGetter.getMetadata();

      const orderValidationsInProgressState =
        checkMinMaxQuantityInProgressState(
          orderData,
          newOrderDetail,
          orderDetail,
          isAdminFlow,
        );
      const { planValidationsInProgressState } =
        orderValidationsInProgressState;

      const {
        planReachMaxRestaurantQuantity,
        planReachMinRestaurantQuantity,
        planReachMaxCanModify,
      } =
        planValidationsInProgressState[
          currentViewDate as keyof typeof planValidationsInProgressState
        ] || {};
      const hasValidationError =
        planReachMaxRestaurantQuantity ||
        planReachMinRestaurantQuantity ||
        planReachMaxCanModify;
      if (!isAdminFlow && hasValidationError) {
        return {
          ...state,
          orderValidationsInProgressState,
        };
      }
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
            orderValidationsInProgressState,
            draftOrderDetail: newOrderDetail,
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
            type: EEditSubOrderHistoryType.FOOD_REMOVED,
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
            orderValidationsInProgressState,
            draftSubOrderChangesHistory: newDraftSubOrderChangesHistory,
            draftOrderDetail: newOrderDetail,
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
              ? EEditSubOrderHistoryType.FOOD_DECREASED
              : EEditSubOrderHistoryType.FOOD_INCREASED,
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
          orderValidationsInProgressState,
          draftSubOrderChangesHistory: newDraftSubOrderChangesHistory,
          draftOrderDetail: newOrderDetail,
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
            ? EEditSubOrderHistoryType.FOOD_DECREASED
            : EEditSubOrderHistoryType.FOOD_INCREASED,
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
        orderValidationsInProgressState,
        draftSubOrderChangesHistory: newDraftSubOrderChangesHistory,
        draftOrderDetail: newOrderDetail,
      };
    },
    resetDraftOrderDetails: (state) => {
      const { planData } = state;
      const { orderDetail = {} } = Listing(planData as TListing).getMetadata();

      return {
        ...state,
        orderValidationsInProgressState: null,
        draftOrderDetail: orderDetail,
      };
    },
    resetDraftSubOrderChangeHistory: (state) => {
      return {
        ...state,
        orderValidationsInProgressState: null,
        draftSubOrderChangesHistory: {},
      };
    },
    updateOrderData: (state, { payload }) => {
      return {
        ...state,
        orderData: payload,
      };
    },
    updateOrderDetailLastTransition: (state, { payload }) => {
      const { planData, draftOrderDetail } = state;
      const { lastTransition, subOrderDate } = payload;
      const { orderDetail } = Listing(planData as TListing).getMetadata();
      const newOrderDetail = {
        ...orderDetail,
        [subOrderDate]: {
          ...(orderDetail[subOrderDate] || {}),
          lastTransition,
        },
      };

      const newPlanData = {
        ...planData,
        attributes: {
          ...planData.attributes,
          metadata: {
            ...planData.attributes.metadata,
            orderDetail: newOrderDetail,
          },
        },
      };

      const newDraftOrderDetail = {
        ...draftOrderDetail,
        [subOrderDate]: {
          ...(draftOrderDetail[subOrderDate] || {}),
          lastTransition,
        },
      };

      return {
        ...state,
        draftOrderDetail: newDraftOrderDetail,
        planData: newPlanData,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      /* =============== queryTransactions =============== */
      .addCase(queryTransactions.pending, (state) => {
        state.queryTransactionsInProgress = true;
      })
      .addCase(queryTransactions.fulfilled, (state, { payload }) => {
        state.queryTransactionsInProgress = false;
        state.transactionMap = payload;
      })
      .addCase(queryTransactions.rejected, (state) => {
        state.queryTransactionsInProgress = false;
      })
      /* =============== loadData =============== */
      .addCase(loadData.pending, (state) => {
        state.fetchOrderInProgress = true;
      })
      .addCase(
        loadData.fulfilled,
        (
          state,
          {
            payload,
            meta: {
              arg: { isAdminFlow = false },
            },
          },
        ) => {
          const {
            orderListing: orderData,
            planListing: planData,
            // eslint-disable-next-line unused-imports/no-unused-vars
            statusCode,
            ...restPayload
          } = payload;

          const { orderDetail = {} } = Listing(planData).getMetadata();

          const orderValidationsInProgressState =
            checkMinMaxQuantityInProgressState(
              orderData,
              orderDetail,
              orderDetail,
              isAdminFlow,
            );

          return {
            ...state,
            orderData,
            planData,
            draftOrderDetail: orderDetail,
            orderValidationsInProgressState,
            isAdminFlow,
            fetchOrderInProgress: false,
            ...restPayload,
          };
        },
      )
      .addCase(loadData.rejected, (state) => {
        state.fetchOrderInProgress = false;
      })

      /* =============== updateOrderGeneralInfo =============== */
      .addCase(updateOrderGeneralInfo.pending, (state) => {
        state.isUpdatingOrderDetails = true;
      })
      .addCase(updateOrderGeneralInfo.fulfilled, (state, { payload }) => {
        state.isUpdatingOrderDetails = false;

        if (!isEmpty(payload)) {
          set(state.orderData, `attributes.metadata`, {
            ...state.orderData.attributes.metadata,
            ...payload,
          });
        }
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
      .addCase(deleteParticipant.fulfilled, (state, { payload }) => {
        state.isDeletingParticipant = false;
        state.participantData = state.participantData.filter(
          (p) => p.id.uuid !== payload.participantId,
        );
        set(
          state.orderData,
          'attributes.metadata.participants',
          payload.participants,
        );
        set(
          state.planData,
          'attributes.metadata.orderDetail',
          payload.newOrderDetail,
        );
        state.draftOrderDetail = payload.newOrderDetail;
      })
      .addCase(deleteParticipant.rejected, (state) => {
        state.isDeletingParticipant = false;
      })
      /* =============== addOrUpdateMemberOrder =============== */
      .addCase(addOrUpdateMemberOrder.pending, (state) => {
        state.addOrUpdateMemberOrderError = null;
        state.addOrUpdateMemberOrderInProgress = true;
      })
      .addCase(addOrUpdateMemberOrder.fulfilled, (state, { payload }) => {
        state.addOrUpdateMemberOrderInProgress = false;
        state.draftOrderDetail = payload?.orderDetail;
        state.planData = payload?.planData;
        if (state.orderData) {
          state.orderData.attributes.metadata.anonymous = payload?.anonymous;
        }
        state.anonymousParticipantData = state.anonymousParticipantData.concat(
          payload?.newUser,
        );
      })
      .addCase(addOrUpdateMemberOrder.rejected, (state, { payload }) => {
        state.addOrUpdateMemberOrderInProgress = false;
        state.addOrUpdateMemberOrderError = payload;
      })
      .addCase(
        querySubOrderChangesHistory.pending,
        (state, { meta: { arg } }) => {
          const { lastRecordCreatedAt } = arg;
          state.querySubOrderChangesHistoryError = null;

          if (lastRecordCreatedAt) state.loadMoreSubOrderChangesHistory = true;
          else state.querySubOrderChangesHistoryInProgress = true;
        },
      )
      .addCase(
        querySubOrderChangesHistory.fulfilled,
        (state, { payload, meta: { arg } }) => {
          const { lastRecordCreatedAt } = arg;
          const { data: items, totalItems } = payload;
          if (lastRecordCreatedAt) state.loadMoreSubOrderChangesHistory = false;
          else state.querySubOrderChangesHistoryInProgress = false;
          state.subOrderChangesHistory = lastRecordCreatedAt
            ? state.subOrderChangesHistory.concat(items)
            : items;
          state.subOrderChangesHistoryTotalItems = totalItems;
          state.lastRecordSubOrderChangesHistoryCreatedAt =
            items?.[items.length - 1]?.createdAt?.seconds;
        },
      )
      .addCase(
        querySubOrderChangesHistory.rejected,
        (state, { error, meta: { arg } }) => {
          const { lastRecordCreatedAt } = arg;
          if (lastRecordCreatedAt) state.loadMoreSubOrderChangesHistory = false;
          else state.querySubOrderChangesHistoryInProgress = false;
          state.querySubOrderChangesHistoryError = error;
        },
      )
      .addCase(updateOrderFromDraftEdit.pending, (state) => {
        state.updateOrderFromDraftEditInProgress = true;
        state.updateOrderFromDraftEditError = null;
      })
      .addCase(updateOrderFromDraftEdit.fulfilled, (state) => {
        state.updateOrderFromDraftEditInProgress = false;
      })
      .addCase(updateOrderFromDraftEdit.rejected, (state, { error }) => {
        state.updateOrderFromDraftEditInProgress = false;
        state.updateOrderFromDraftEditError = error;
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
        state.draftOrderDetail = payload;
      })
      .addCase(updatePlanOrderDetail.rejected, (state) => {
        state.isUpdatingOrderDetails = false;
      })

      .addCase(fetchQuotation.pending, (state) => {
        state.fetchQuotationInProgress = true;
        state.fetchQuotationError = null;
      })
      .addCase(fetchQuotation.fulfilled, (state, { payload }) => {
        state.fetchQuotationInProgress = false;
        state.quotation = payload;
      })
      .addCase(fetchQuotation.rejected, (state, { error }) => {
        state.fetchQuotationInProgress = false;
        state.fetchQuotationError = error.message;
      })

      .addCase(disallowMember.fulfilled, (state, { payload }) => {
        const { currentViewDate, participantId } = payload || {};

        set(
          state.planData.attributes.metadata.orderDetail,
          `${currentViewDate}.memberOrders.${participantId}.status`,
          EParticipantOrderStatus.notAllowed,
        );

        set(
          state.draftOrderDetail,
          `${currentViewDate}.memberOrders.${participantId}.status`,
          EParticipantOrderStatus.notAllowed,
        );
      })

      .addCase(restoredDisAllowedMember.fulfilled, (state, { payload }) => {
        const { currentViewDate, newMembersOrderValues } = payload || {};

        set(
          state.planData.attributes.metadata.orderDetail,
          `${currentViewDate}.memberOrders`,
          {
            ...state.planData.attributes.metadata.orderDetail[currentViewDate]
              .memberOrders,
            ...newMembersOrderValues,
          },
        );

        set(state.draftOrderDetail, `${currentViewDate}.memberOrders`, {
          ...state.draftOrderDetail[currentViewDate].memberOrders,
          ...newMembersOrderValues,
        });
      })

      .addCase(deleteDisAllowedMember.fulfilled, (state, { payload }) => {
        set(
          state.planData,
          `attributes.metadata.orderDetail`,
          payload.orderDetail,
        );

        state.draftOrderDetail = {
          ...state.draftOrderDetail,
          ...payload.orderDetail,
        };
      });
  },
});

// ================ Actions ================ //
export const OrderManagementsAction = OrderManagementSlice.actions;
export default OrderManagementSlice.reducer;

// ================ Selectors ================ //
export const orderDetailsAnyActionsInProgress = (state: RootState) => {
  const {
    fetchOrderInProgress,
    isDeletingParticipant,
    isUpdatingOrderDetails,
  } = state.OrderManagement;

  return (
    fetchOrderInProgress || isDeletingParticipant || isUpdatingOrderDetails
  );
};
