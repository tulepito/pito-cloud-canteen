import { combineReducers, configureStore } from '@reduxjs/toolkit';

import { createSdkInstance } from '../sharetribe/sdk';

import * as globalReducers from './slices';

const combinedReducer = combineReducers({
  ...globalReducers,
});

const rootReducer: typeof combinedReducer = (state, action) => {
  return combinedReducer(state, action);
};

export const makeStore = () => {
  const sdk = createSdkInstance();

  return configureStore({
    reducer: rootReducer,
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
