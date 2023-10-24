import { createSlice, current } from '@reduxjs/toolkit';
import isEmpty from 'lodash/isEmpty';

import { queryPartnerOrdersApi } from '@apis/partnerApi';
import { createAsyncThunk } from '@redux/redux.helper';
import { CurrentUser, Listing } from '@src/utils/data';
import { formatTimestamp } from '@src/utils/dates';
import { EOrderPaymentStatus } from '@src/utils/enums';
import { toNonAccentVietnamese } from '@src/utils/string';
import { ETransition } from '@src/utils/transaction';
import type { TListing, TObject, TPagination } from '@src/utils/types';

// ================ Initial states ================ //
type TPartnerManageOrdersState = {
  isFirstLoad: boolean;
  allSubOrders: TObject[];
  currentSubOrders: TObject[];
  fetchOrderInProgress: boolean;
  fetchOrderError: any;
  pagination: TPagination;
};
const initialState: TPartnerManageOrdersState = {
  isFirstLoad: true,
  allSubOrders: [],
  currentSubOrders: [],
  fetchOrderInProgress: false,
  fetchOrderError: null,
  pagination: {
    totalItems: 0,
    totalPages: 1,
    page: 1,
    perPage: 10,
  },
};

const isValidStatus = (lastTransition: ETransition, statuses: string[]) => {
  switch (lastTransition) {
    case ETransition.INITIATE_TRANSACTION:
    case ETransition.PARTNER_CONFIRM_SUB_ORDER:
    case ETransition.PARTNER_REJECT_SUB_ORDER:
      return statuses.includes('inProgress');

    case ETransition.COMPLETE_DELIVERY:
      return statuses.includes('delivered');

    case ETransition.START_DELIVERY:
      return statuses.includes('delivering');

    case ETransition.CANCEL_DELIVERY:
    case ETransition.OPERATOR_CANCEL_PLAN:
    case ETransition.OPERATOR_CANCEL_AFTER_PARTNER_CONFIRMED:
    case ETransition.OPERATOR_CANCEL_AFTER_PARTNER_REJECTED:
      return statuses.includes('canceled');

    default:
      return false;
  }
};

// ================ Thunk types ================ //

// ================ Async thunks ================ //
const loadData = createAsyncThunk(
  'app/PartnerManageOrders/LOAD_DATA',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { currentUser } = getState().user;
      const { restaurantListingId } = CurrentUser(currentUser!).getMetadata();

      if (restaurantListingId) {
        const response = await queryPartnerOrdersApi(restaurantListingId);

        const { orders = [] } = response?.data || {};

        return { orders, restaurantId: restaurantListingId };
      }

      return [];
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const PartnerManageOrdersThunks = {
  loadData,
};

// ================ Slice ================ //
const PartnerManageOrdersSlice = createSlice({
  name: 'PartnerManageOrders',
  initialState,
  reducers: {
    resetStates: () => ({ ...initialState }),
    filterData: (state, { payload }) => {
      const { allSubOrders, pagination } = current(state);
      const { perPage } = pagination;
      const {
        page,
        name,
        subOrderId,
        startTime,
        endTime,
        status = '',
        isMobile,
      } = payload;
      const statusList = status.split(',') || [];
      const isPaidStatus = statusList.includes(EOrderPaymentStatus.isPaid);
      const isNotPaidStatus = statusList.includes(EOrderPaymentStatus.isPaid);
      const statuses = statusList.filter(
        (orderStateMaybe: any) =>
          orderStateMaybe !== '' && !(orderStateMaybe in EOrderPaymentStatus),
      );

      const validSubOrders = allSubOrders.filter((subOrder) => {
        const {
          date,
          companyName,
          orderTitle,
          startDate,
          endDate,
          lastTransition,
          isPaid,
        } = subOrder;
        const dayIndex = new Date(Number(date)).getDay();
        const subOrderTitle = `#${orderTitle}-${dayIndex > 0 ? dayIndex : 7}`;
        const subOrderName = `${companyName}_${formatTimestamp(date)}`;

        const statusCheck =
          isEmpty(statuses) || isValidStatus(lastTransition, statuses);
        const paidStatusCheck =
          (isPaidStatus && isPaid) ||
          (isNotPaidStatus && !isPaid) ||
          (!isPaidStatus && !isNotPaidStatus);

        const isValid =
          statusCheck &&
          paidStatusCheck &&
          (isEmpty(name) ||
            toNonAccentVietnamese(subOrderName, true).includes(
              toNonAccentVietnamese(name, true),
            )) &&
          (isEmpty(subOrderId) ||
            toNonAccentVietnamese(subOrderTitle, true).includes(
              toNonAccentVietnamese(subOrderId, true),
            )) &&
          (isEmpty(startTime) ||
            (Number(startTime) >= Number(startDate || 0) &&
              Number(startTime) <= Number(endDate || 0))) &&
          (isEmpty(endTime) ||
            (Number(endTime) <= Number(endDate || 0) &&
              Number(startTime) >= Number(startDate || 0)));

        return isValid;
      });

      state.pagination = {
        ...pagination,
        perPage,
        totalItems: validSubOrders.length,
        totalPages: Math.round(validSubOrders.length / perPage + 0.5),
        page,
      };
      state.currentSubOrders = isMobile
        ? validSubOrders
        : validSubOrders.slice(
            0 + (page - 1) * perPage,
            page * perPage >= validSubOrders.length
              ? validSubOrders.length
              : page * perPage,
          );
    },
  },
  extraReducers: (builder) => {
    builder
      /* =============== loadData =============== */
      .addCase(loadData.pending, (state) => {
        state.fetchOrderInProgress = true;
        state.fetchOrderError = null;
      })
      .addCase(loadData.fulfilled, (state, { payload }: any) => {
        const { pagination } = current(state);
        const { perPage } = pagination;
        const { orders: orderList, restaurantId } = payload;

        const subOrderList = (orderList as TObject[]).reduce<TObject[]>(
          (result, curr) => {
            const { plan, quotation } = curr || {};
            const orderGetter = Listing(curr as TListing);
            const orderMetadata = orderGetter.getMetadata();
            const { title } = orderGetter.getAttributes();
            const {
              companyName = 'PCC',
              orderVATPercentage,
              serviceFees = {},
              vatSettings = {},
            } = orderGetter.getMetadata();
            const { orderDetail = {}, orderId } = Listing(plan).getMetadata();

            const subOrders = Object.entries<TObject>(orderDetail)
              .sort((a, b) => Number(a[0]) - Number(b[0]))
              .reduce<TObject[]>((subOrderRes, currSubOrderEntry) => {
                const [date, data] = currSubOrderEntry;

                return restaurantId !== data?.restaurant?.id ||
                  isEmpty(data?.transactionId)
                  ? subOrderRes
                  : subOrderRes.concat({
                      ...data,
                      date,
                      orderTitle: title,
                      companyName,
                      ...orderMetadata,
                      orderId,
                      serviceFees,
                      quotation,
                      orderVATPercentage,
                      vatSettings,
                    });
              }, []);

            return result.concat(subOrders);
          },
          [],
        );
        state.allSubOrders = subOrderList;
        state.currentSubOrders = subOrderList;
        state.pagination = {
          ...pagination,
          totalItems: subOrderList.length,
          totalPages: Math.round(subOrderList.length / perPage + 0.5),
        };
        state.fetchOrderInProgress = false;
        state.isFirstLoad = false;
      })
      .addCase(loadData.rejected, (state, { payload }) => {
        state.fetchOrderInProgress = false;
        state.fetchOrderError = payload;
      });
  },
});

// ================ Actions ================ //
export const PartnerManageOrdersActions = PartnerManageOrdersSlice.actions;
export default PartnerManageOrdersSlice.reducer;

// ================ Selectors ================ //
