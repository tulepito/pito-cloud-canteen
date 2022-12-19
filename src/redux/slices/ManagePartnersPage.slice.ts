/* eslint-disable import/no-cycle */

import type { ThunkAPI } from '@redux/store';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { entityRefs } from '@utils/data';
import { EListingType } from '@utils/enums';
import { storableError } from '@utils/errors';
import type { TPagination } from '@utils/types';

import { addMarketplaceEntities } from './marketplaceData.slice';

const RESULT_PAGE_SIZE = 10;

interface ManageParnersState {
  partnerRefs: any[];
  queryPartnersInProgress: boolean;
  queryPartnersError: any;
  pagination: TPagination;
}

const QUERY_PARTNERS = 'app/ManagePartnersPage/QUERY_PARTNERS';

const queryPartners = createAsyncThunk(
  QUERY_PARTNERS,
  async (
    params: any,
    { dispatch, extra: sdk, fulfillWithValue, rejectWithValue }: ThunkAPI,
  ) => {
    try {
      const searchParams = {
        ...params,
        meta_listingType: EListingType.partner,
        perPage: RESULT_PAGE_SIZE,
        include: ['author'],
        'fields.listing': [
          'title',
          'geolocation',
          'price',
          'publicData',
          'metadata',
        ],
        'fields.user': ['profile.displayName', 'profile.abbreviatedName'],
      };
      const response = await sdk.listings.query(searchParams);
      dispatch(addMarketplaceEntities(response));
      return fulfillWithValue(response);
    } catch (error: any) {
      console.error('Query company error : ', error);
      return rejectWithValue(storableError(error.response.data));
    }
  },
);

export const managePartnerThunks = {
  queryPartners,
};

const initialState: ManageParnersState = {
  partnerRefs: [],
  queryPartnersInProgress: false,
  queryPartnersError: true,
  pagination: {
    totalItems: 0,
    totalPages: 0,
    page: 0,
    perPage: 0,
  },
};

export const managePartnersSlice = createSlice({
  name: 'ManagePartnersPage',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(queryPartners.pending, (state) => ({
        ...state,
        queryPartnersError: null,
        queryPartnersInProgress: true,
      }))
      .addCase(queryPartners.fulfilled, (state, action) => {
        const response = action.payload;
        return {
          ...state,
          partnerRefs: entityRefs(response.data.data),
          queryPartnersInProgress: false,
          pagination: response.data.meta,
        };
      })
      .addCase(queryPartners.rejected, (state, action) => ({
        ...state,
        queryPartnersError: action.payload,
        queryPartnersInProgress: false,
      }));
  },
});

export default managePartnersSlice.reducer;
