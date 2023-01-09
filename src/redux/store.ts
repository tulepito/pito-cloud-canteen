import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { getSdk } from '@services/sdk';
import { createWrapper, HYDRATE } from 'next-redux-wrapper';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import { createSdkInstance } from '../sharetribe/sdk';
import * as globalReducers from './slices';

const combinedReducer = combineReducers({
  ...globalReducers,
});

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['Order', 'ManageCompaniesPage'],
};
const rootReducer: typeof combinedReducer = (state, action) => {
  if (action.type === HYDRATE) {
    const nextState = {
      ...state,
      ...action.payload,
    };
    return nextState;
  }
  return combinedReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
export const makeStore = (context: any) => {
  let sdk = createSdkInstance();

  if (context?.ctx) {
    const { ctx } = context;
    const { req, res } = ctx;
    sdk = getSdk(req, res);
  }

  return configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
        thunk: { extraArgument: sdk },
      }),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];
export type RootState = ReturnType<typeof rootReducer>;

export type ThunkAPI = {
  dispatch?: any;
  getState?: any;
  extra: any;
  rejectWithValue?: any;
  fulfillWithValue?: any;
};

const wrapper = createWrapper<AppStore>(makeStore, { debug: false });
export default wrapper;
