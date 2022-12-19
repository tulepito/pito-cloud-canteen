import type {
  Action,
  AnyAction,
  Store,
  ThunkAction,
  ThunkDispatch,
} from '@reduxjs/toolkit';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { getSdk } from '@services/sdk';
import { createWrapper, HYDRATE } from 'next-redux-wrapper';

import { createSdkInstance } from '../sharetribe/sdk';
import * as globalReducers from './slices';

const combinedReducer = combineReducers({
  ...globalReducers,
});

const rootReducer = (state: RootState, action: AnyAction) => {
  if (action.type === HYDRATE) {
    const nextState = {
      ...state,
      ...action.payload,
    };
    return nextState;
  }
  return combinedReducer(state, action);
};

export const makeStore = (context: any) => {
  let sdk = createSdkInstance();

  if (context?.ctx) {
    const { ctx } = context;
    const { req, res } = ctx;
    sdk = getSdk(req, res);
  }

  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
        thunk: { extraArgument: sdk },
      }),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = Store['dispatch'] &
  ThunkDispatch<RootState, null, AnyAction>;
export type RootState = ReturnType<Store['getState']>;
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

const wrapper = createWrapper<AppStore>(makeStore, { debug: false });
export default wrapper;
