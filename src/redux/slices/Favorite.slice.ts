import { favoriteRestaurantApi } from '@apis/companyApi';
import { createAsyncThunk } from '@redux/redux.helper';
import { createSlice } from '@reduxjs/toolkit';

import { QuizThunks } from './Quiz.slice';

// ================ Initial states ================ //
type TFavoriteState = {
  favoriteRestaurantInProgress: boolean;
  favoriteRestaurantError: any;
};
const initialState: TFavoriteState = {
  favoriteRestaurantInProgress: false,
  favoriteRestaurantError: null,
};

// ================ Thunk types ================ //
const FAVORITE_RESTAURANT = 'app/Favorite/FAVORITE_RESTAURANT';

// ================ Async thunks ================ //
const favoriteRestaurant = createAsyncThunk(
  FAVORITE_RESTAURANT,
  async (
    {
      companyId,
      restaurantId,
    }: {
      companyId: string;
      restaurantId: string;
    },
    { dispatch },
  ) => {
    await favoriteRestaurantApi(companyId, restaurantId);
    await dispatch(QuizThunks.fetchSelectedCompany(companyId));
    return '';
  },
);
export const FavoriteThunks = {
  favoriteRestaurant,
};

// ================ Slice ================ //
const FavoriteSlice = createSlice({
  name: 'Favorite',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(favoriteRestaurant.pending, (state) => {
        state.favoriteRestaurantInProgress = true;
        state.favoriteRestaurantError = null;
      })
      .addCase(favoriteRestaurant.fulfilled, (state) => {
        state.favoriteRestaurantInProgress = false;
      })
      .addCase(favoriteRestaurant.rejected, (state, { error }) => {
        state.favoriteRestaurantInProgress = false;
        state.favoriteRestaurantError = error.message;
      });
  },
});

// ================ Actions ================ //
export const FavoriteActions = FavoriteSlice.actions;
export default FavoriteSlice.reducer;

// ================ Selectors ================ //
