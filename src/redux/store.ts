import type { Action, ThunkAction } from '@reduxjs/toolkit';
import { combineReducers, configureStore } from '@reduxjs/toolkit';

import { sdk } from '../sharetribe/sdk';
import * as globalReducers from './slices';

const rootReducer = combineReducers({
  ...globalReducers,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: { extraArgument: sdk },
    }),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
export type ThunkAPI = {
  dispatch?: any;
  getState?: any;
  extra: any;
  rejectWithValue?: any;
  fulfillWithValue?: any;
};
export default store;
