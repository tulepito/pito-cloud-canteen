import { deliveryDaySessionAdapter } from '@helpers/orderHelper';
import { createAsyncThunk } from '@redux/redux.helper';
import { createSlice } from '@reduxjs/toolkit';
import { ListingTypes } from '@src/types/listingTypes';
import { denormalisedResponseEntities, Listing } from '@utils/data';
import { convertWeekDay, getDaySessionFromDeliveryTime } from '@utils/dates';
import type { TListing, TPagination } from '@utils/types';

type TSelectRestaurantPageSliceInitialState = {
  fetchRestaurantsPending: boolean;
  restaurants: any[] | null;
  pagination: TPagination | null;
  selectRestaurantPageError: any;

  foodOfRestaurant: string | null;
  foodList: any[];
  fetchFoodPending: boolean;
  fetchFoodError: any;

  selectedRestaurant: TListing | null;
};

const initialState: TSelectRestaurantPageSliceInitialState = {
  fetchRestaurantsPending: false,
  restaurants: null,
  pagination: null,
  selectRestaurantPageError: null,
  foodOfRestaurant: null,
  foodList: [],
  fetchFoodPending: false,
  fetchFoodError: null,
  selectedRestaurant: null,
};

// ================ Thunk types ================ //
const QUERY_RESTAURANTS = 'app/SelectRestaurantPage/QUERY_RESTAURANTS';
const QUERY_RESTAURANT_FOOD = 'app/SelectRestaurantPage/QUERY_RESTAURANT_FOOD';

// ================ Thunks ================ //
const getRestaurants = createAsyncThunk(
  QUERY_RESTAURANTS,
  async (params: Record<string, any> | undefined, { extra: sdk }) => {
    const queryParams: Record<string, any> = {};

    if (params) {
      queryParams.keywords = params.title;
    }
    const {
      dateTime,
      favoriteRestaurantIdList = [],
      favoriteFoodIdList = [],
      packagePerMember,
      deliveryHour = '6:30',
      nutritions = [],
      title = '',
    } = params || {};
    const dayOfWeek = convertWeekDay(dateTime.weekday).key;
    const deliveryDaySession = getDaySessionFromDeliveryTime(deliveryHour);
    const mealType = deliveryDaySessionAdapter(deliveryDaySession);
    const response = await sdk.listings.query({
      keywords: title,
      meta_listingState: 'published',
      meta_listingType: ListingTypes.MENU,
      pub_startDate: `,${dateTime.toMillis()}`,
      pub_daysOfWeek: `has_any:${dayOfWeek}`,
      pub_mealTypes: `has_any:${mealType}`,
      ...(nutritions.length > 0
        ? { [`meta_${dayOfWeek}Nutritions`]: `has_any:${nutritions.join(',')}` }
        : {}),
      ...(favoriteRestaurantIdList.length > 0
        ? {
            meta_restaurantId: favoriteRestaurantIdList.join(','),
          }
        : {}),
      ...(favoriteFoodIdList.length > 0
        ? {
            [`meta_${dayOfWeek}FoodIdList`]: `has_any:${favoriteFoodIdList.join(
              ',',
            )}`,
          }
        : {}),
      [`pub_${dayOfWeek}AverageFoodPrice`]: `,${packagePerMember}`,
    });

    const { meta } = response?.data || {};

    const menuList = denormalisedResponseEntities(response);
    const restaurantList = await Promise.all(
      menuList.map(async (menu: TListing) => {
        const { restaurantId } = Listing(menu).getMetadata();
        const restaurantResponse = await sdk.listings.show({
          id: restaurantId,
        });
        return {
          restaurantInfo: denormalisedResponseEntities(restaurantResponse)[0],
          menu,
        };
      }),
    );
    return { restaurants: restaurantList, pagination: meta };
  },
);

const getRestaurantFood = createAsyncThunk(
  QUERY_RESTAURANT_FOOD,
  async (
    { menuId, dateTime, favoriteFoodIdList = [] }: any,
    { extra: sdk, getState },
  ) => {
    const { order } = getState().Order;
    const { packagePerMember, nutritions = [] } = Listing(
      order as TListing,
    ).getMetadata();
    const dayOfWeek = convertWeekDay(dateTime.weekday).key;
    const response = await sdk.listings.query({
      pub_menuIdList: `has_any:${menuId}`,
      meta_listingType: ListingTypes.FOOD,
      pub_menuWeekDay: `has_any:${dayOfWeek}`,
      price: `,${packagePerMember}`,
      ...(nutritions.length > 0
        ? { pub_nutritions: `has_any:${nutritions.join(',')}` }
        : {}),
      ...(favoriteFoodIdList.length > 0
        ? {
            ids: favoriteFoodIdList.join(','),
          }
        : {}),
    });
    const result = denormalisedResponseEntities(response);
    return { foodList: result };
  },
);

export const selectRestaurantPageThunks = {
  getRestaurants,
  getRestaurantFood,
};

const SelectRestaurantPageSlice = createSlice({
  name: 'SelectRestaurantPage',
  initialState,
  reducers: {
    setSelectedRestaurant: (state, { payload }) => ({
      ...state,
      selectedRestaurant: payload,
    }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(getRestaurants.pending, (state) => {
        return {
          ...state,
          fetchRestaurantsPending: true,
          selectRestaurantPageError: null,
        };
      })
      .addCase(getRestaurants.fulfilled, (state, { payload }) => {
        const { pagination, restaurants } = payload;
        state.restaurants = restaurants;
        state.pagination = pagination;
        state.fetchRestaurantsPending = false;
      })
      .addCase(getRestaurants.rejected, (state, { error }) => {
        return {
          ...state,
          selectRestaurantPageError: error,
          fetchRestaurantsPending: false,
        };
      })

      .addCase(getRestaurantFood.pending, (state) => {
        state.fetchFoodPending = true;
        state.fetchFoodError = null;
        state.foodList = [];
      })
      .addCase(getRestaurantFood.fulfilled, (state, { payload }) => {
        state.fetchFoodPending = false;
        state.foodList = payload.foodList;
      })
      .addCase(getRestaurantFood.rejected, (state, { error }) => {
        state.fetchFoodPending = false;
        state.fetchFoodError = error;
        state.foodList = [];
      });
  },
});

export const { setSelectedRestaurant } = SelectRestaurantPageSlice.actions;

export default SelectRestaurantPageSlice.reducer;
