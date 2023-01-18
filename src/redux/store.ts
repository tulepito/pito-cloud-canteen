import { combineReducers, configureStore } from '@reduxjs/toolkit';
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

const persistedReducer = persistReducer(persistConfig, combinedReducer);

export const makeStore = () => {
  const sdk = createSdkInstance();

  return configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
        thunk: { extraArgument: sdk },
      }),
  });
};

export default makeStore();

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];
export type RootState = ReturnType<typeof combinedReducer>;
