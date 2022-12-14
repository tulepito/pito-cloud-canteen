import { createSlice } from '@reduxjs/toolkit';
import { updatedEntities } from '@utils/data';

interface CompanyState {
  entities?: any;
}

const merge = (state: CompanyState, sdkResponse: any) => {
  const apiResponse = sdkResponse.data;
  return {
    ...state,
    entities: updatedEntities({ ...state.entities }, apiResponse),
  };
};

const initialState: CompanyState = {
  // Database of all the fetched entities.
  entities: {},
};
export const marketplaceDataSlice = createSlice({
  name: 'marketplaceData',
  initialState,
  reducers: {
    addMarketplaceEntities: (state, action) => {
      return merge(state, action.payload);
    },
  },
  extraReducers: () => {},
});

export const { addMarketplaceEntities } = marketplaceDataSlice.actions;

export default marketplaceDataSlice.reducer;
