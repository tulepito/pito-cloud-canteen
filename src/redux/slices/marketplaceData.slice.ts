import { createSlice } from '@reduxjs/toolkit';

import { createDeepEqualSelector } from '@redux/redux.helper';
import type { RootState } from '@redux/store';
import { denormalisedEntities, updatedEntities } from '@utils/data';
import type { TObject } from '@utils/types';

const initialState = {
  entities: {},
};

const merge = (entities: TObject, sdkResponse: any) => {
  const apiResponse = sdkResponse.data;

  return updatedEntities(entities, apiResponse);
};

const marketplaceDataSlice = createSlice({
  name: 'marketplaceData',
  initialState,
  reducers: {
    addMarketplaceEntities(state, action) {
      state.entities = merge(state.entities, action.payload);
    },
  },
});

export const { addMarketplaceEntities } = marketplaceDataSlice.actions;

export default marketplaceDataSlice.reducer;

export const getMarketplaceEntitiesSelector = createDeepEqualSelector(
  (state: RootState) => state.marketplaceData.entities,
  (_: any, refs: Array<any>) => refs,
  (entities: any, refs: any) => denormalisedEntities(entities, refs, false),
);

export const getMarketplaceEntitySelector = createDeepEqualSelector(
  (state: RootState) => state.marketplaceData.entities,
  (_: any, ref: any) => ref,
  (entities: any, ref: any) => {
    const [entity] = denormalisedEntities(entities, [ref], false);

    return entity;
  },
);
