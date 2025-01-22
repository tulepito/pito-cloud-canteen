import { createSlice } from '@reduxjs/toolkit';
import uniq from 'lodash/uniq';

import { bookerPostRatingApi } from '@apis/companyApi';
import type { POSTCompanyRatingsBody } from '@pages/api/company/ratings/index.api';
import { createAsyncThunk } from '@redux/redux.helper';
import type { Image, VariantKey } from '@src/types/utils';
import { denormalisedResponseEntities, Listing } from '@src/utils/data';
import type { TListing } from '@src/utils/types';

export interface RestaurantByDay {
  restaurantId: string;
  restaurantName: string;
  timestamp: number;
}

// ================ Initial states ================ //
type TOrderRatingState = {
  order: TListing;
  orderDetail: any;

  fetchOrderInProgress: boolean;
  fetchOrderError: any;

  restaurantsByDay: RestaurantByDay[];

  foodListByRestaurant: {
    [restaurantIdAndTimestamp: string]: {
      foodId: string;
      foodName: string;
    }[];
  };

  fetchFoodListByRestaurantInProgress: boolean;
  fetchFoodListByRestaurantError: any;

  postRatingInProgress: boolean;
  postRatingError: any;
};
const initialState: TOrderRatingState = {
  order: null!,
  orderDetail: {},

  fetchOrderInProgress: false,
  fetchOrderError: null,

  restaurantsByDay: [],
  foodListByRestaurant: {},

  fetchFoodListByRestaurantInProgress: false,
  fetchFoodListByRestaurantError: null,

  postRatingInProgress: false,
  postRatingError: null,
};

// ================ Thunk types ================ //
const FETCH_ORDER = 'app/orderRating/FETCH_ORDER';
const FETCH_FOOD_LIST_BY_RESTAURANT =
  'app/orderRating/FETCH_FOOD_LIST_BY_RESTAURANT';
const POST_RATING = 'app/orderRating/POST_RATING';
// ================ Async thunks ================ //
const fetchOrder = createAsyncThunk(
  FETCH_ORDER,
  async (orderId: string, { extra: sdk }) => {
    const response = denormalisedResponseEntities(
      await sdk.listings.show({
        id: orderId,
      }),
    )[0];

    const planId = Listing(response).getMetadata().plans[0];

    const plan = denormalisedResponseEntities(
      await sdk.listings.show({
        id: planId,
      }),
    )[0];
    const { orderDetail } = Listing(plan).getMetadata();

    const restaurantsByDay = await Promise.all(
      Object.keys(orderDetail).map(async (timestamp: string) => {
        const restaurantId = orderDetail[timestamp].restaurant.id;
        const restaurant = denormalisedResponseEntities(
          await sdk.listings.show({
            id: restaurantId,
          }),
        )[0];

        return {
          restaurantId,
          restaurantName: Listing(restaurant).getAttributes().title,
          timestamp: Number(timestamp),
        };
      }),
    );

    return {
      order: response,
      orderDetail,
      restaurantsByDay,
    };
  },
);

const fetchFoodListByRestaurant = createAsyncThunk(
  FETCH_FOOD_LIST_BY_RESTAURANT,
  async ({ restaurantId, timestamp }: any, { extra: sdk, getState }) => {
    const { orderDetail } = getState().OrderRating;
    const orderInDay = orderDetail[timestamp];
    const { memberOrders = {} } = orderInDay;
    const orderedFoodIdList = uniq(
      Object.values(memberOrders).reduce((result: string[], member: any) => {
        if (member?.foodId) {
          return [...result, member.foodId];
        }

        return result;
      }, []),
    );

    const foodList = await Promise.all(
      orderedFoodIdList.map(async (foodId: string) => {
        const food = denormalisedResponseEntities(
          await sdk.listings.show({
            id: foodId,
          }),
        )[0];

        return {
          foodId,
          foodName: Listing(food).getAttributes().title,
        };
      }),
    );

    return {
      restaurantId,
      timestamp,
      foodList,
    };
  },
);

const postRating = createAsyncThunk(
  POST_RATING,
  async (
    data: Omit<POSTCompanyRatingsBody, 'imageUrlList' | 'imageIdList'>,
    { getState },
  ) => {
    const { images } = getState().uploadImage;

    const { data: response } = await bookerPostRatingApi({
      ...data,
      imageUrlList: Object.values(
        images as (Image['attributes'] & {
          imageId: string;
          uploadedImage: Image;
        })[],
      ).reduce<string[]>((result, image) => {
        if (image.uploadedImage.attributes.variants) {
          const { variants } = image.uploadedImage.attributes;
          const firstVariantKey = Object.keys(variants)[0];

          result.push(variants[firstVariantKey as VariantKey].url);
        }

        return result;
      }, []),
      imageIdList: Object.values(images as { imageId: string }[]).map(
        (image) => image.imageId,
      ),
    });

    return response;
  },
);

export const OrderRatingThunks = {
  fetchOrder,
  fetchFoodListByRestaurant,
  postRating,
};

// ================ Slice ================ //
const OrderRatingSlice = createSlice({
  name: 'OrderRating',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrder.pending, (state) => {
        state.fetchOrderInProgress = true;
        state.fetchOrderError = null;
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.fetchOrderInProgress = false;
        state.order = action.payload.order;
        state.orderDetail = action.payload.orderDetail;
        state.restaurantsByDay = action.payload.restaurantsByDay;
      })
      .addCase(fetchOrder.rejected, (state, action) => {
        state.fetchOrderInProgress = false;
        state.fetchOrderError = action.error;
      })

      .addCase(fetchFoodListByRestaurant.pending, (state) => {
        state.fetchFoodListByRestaurantInProgress = true;
        state.fetchFoodListByRestaurantError = null;
      })
      .addCase(fetchFoodListByRestaurant.fulfilled, (state, action) => {
        state.fetchFoodListByRestaurantInProgress = false;
        state.foodListByRestaurant[
          `${action.payload.restaurantId} - ${action.payload.timestamp}`
        ] = action.payload.foodList;
      })
      .addCase(fetchFoodListByRestaurant.rejected, (state, action) => {
        state.fetchFoodListByRestaurantInProgress = false;
        state.fetchFoodListByRestaurantError = action.error;
      })

      .addCase(postRating.pending, (state) => {
        state.postRatingInProgress = true;
        state.postRatingError = null;
      })
      .addCase(postRating.fulfilled, (state) => {
        state.postRatingInProgress = false;
      })
      .addCase(postRating.rejected, (state, action) => {
        state.postRatingInProgress = false;
        state.postRatingError = action.error;
      });
  },
});

// ================ Actions ================ //
export const OrderRatingActions = OrderRatingSlice.actions;
export default OrderRatingSlice.reducer;

// ================ Selectors ================ //
