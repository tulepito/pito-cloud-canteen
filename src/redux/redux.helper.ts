import type {
  AsyncThunk,
  AsyncThunkOptions,
  AsyncThunkPayloadCreator,
} from '@reduxjs/toolkit';
import { createAsyncThunk as createAsyncThunkFn } from '@reduxjs/toolkit';
import isEqual from 'lodash/isEqual';
import { createSelectorCreator, defaultMemoize } from 'reselect';

import type { RootState } from './store';

export const createDeepEqualSelector = createSelectorCreator(
  defaultMemoize,
  isEqual,
);

type AsyncThunkConfig = {
  state: RootState;
  extra: any;
};

export function createAsyncThunk<Returned, ThunkArg = void>(
  typePrefix: string,
  payloadCreator: AsyncThunkPayloadCreator<
    Returned,
    ThunkArg,
    AsyncThunkConfig
  >,
  options?: AsyncThunkOptions<ThunkArg, AsyncThunkConfig>,
): AsyncThunk<Returned, ThunkArg, AsyncThunkConfig> {
  return createAsyncThunkFn(typePrefix, payloadCreator, options);
}
