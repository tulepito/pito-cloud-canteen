import { createSlice } from '@reduxjs/toolkit';

import { queryPartnerOrdersApi } from '@apis/partnerApi';
import { createAsyncThunk } from '@redux/redux.helper';
import { CurrentUser, Listing } from '@src/utils/data';
import type { TListing, TObject } from '@src/utils/types';

// ================ Initial states ================ //
type TPartnerManageOrdersState = {
  allSubOrders: TObject[];
  currentSubOrders: TObject[];
  fetchOrderInProgress: boolean;
  fetchOrderError: any;
};
const initialState: TPartnerManageOrdersState = {
  allSubOrders: [],
  currentSubOrders: [],
  fetchOrderInProgress: false,
  fetchOrderError: null,
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

        return orders;
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
  reducers: {},
  extraReducers: (builder) => {
    builder
      /* =============== loadData =============== */
      .addCase(loadData.pending, (state) => {
        state.fetchOrderInProgress = true;
        state.fetchOrderError = null;
      })
      .addCase(loadData.fulfilled, (state, { payload }) => {
        const orderList = payload;

        const subOrderList = (orderList as TObject[]).reduce<TObject[]>(
          (result, curr) => {
            const { plan } = curr || {};
            const orderGetter = Listing(curr as TListing);
            const orderMetadata = orderGetter.getMetadata();
            const { title } = orderGetter.getAttributes();
            const { companyName = 'PCC' } = orderGetter.getMetadata();
            const { orderDetail = {}, orderId } = Listing(plan).getMetadata();

            const subOrders = Object.entries<TObject>(orderDetail)
              .sort((a, b) => Number(a[0]) - Number(b[0]))
              .reduce<TObject[]>((subOrderRes, currSubOrderEntry) => {
                const [date, data] = currSubOrderEntry;

                return data?.transactionId
                  ? subOrderRes.concat({
                      ...data,
                      date,
                      orderTitle: title,
                      companyName,
                      ...orderMetadata,
                      orderId,
                    })
                  : subOrderRes;
              }, []);

            return result.concat(subOrders);
          },
          [],
        );
        state.allSubOrders = subOrderList;
        state.currentSubOrders = subOrderList;
        state.fetchOrderInProgress = false;
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
