import { combineReducers, configureStore } from '@reduxjs/toolkit';

import { createSdkInstance } from '../sharetribe/sdk';
import * as globalReducers from './slices';

const combinedReducer = combineReducers({
  ...globalReducers,
});

export const makeStore = () => {
  const sdk = createSdkInstance();

  return configureStore({
    reducer: combinedReducer,
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
