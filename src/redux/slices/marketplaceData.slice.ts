import { createSlice } from '@reduxjs/toolkit';
import { updatedEntities } from '@utils/data';

interface MarketplaceDataState {
  entities?: any;
}

const merge = (state: MarketplaceDataState, sdkResponse: any) => {
  const apiResponse = sdkResponse.data;
  return {
    ...state,
    entities: updatedEntities(state.entities, apiResponse),
  };
};

const initialState: MarketplaceDataState = {
  // Database of all the fetched entities.
  entities: {},
};

export const marketplaceDataSlice = createSlice({
  name: 'marketplaceData',
  initialState,
  reducers: {
    addMarketplaceEntities: (state, action) => {
      const data = action.payload;
      // Something went wrong with this. Fix later
      const newState = merge(state, data);
      return newState;
    },
  },
  extraReducers: () => {},
});

export const { addMarketplaceEntities } = marketplaceDataSlice.actions;

export default marketplaceDataSlice.reducer;
