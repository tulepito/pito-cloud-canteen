import { createSlice } from '@reduxjs/toolkit';

import {
  getCompaniesAdminApi,
  getCompanyMembersDetailsApi,
  updateCompanyStatusApi,
} from '@apis/index';
import { createAsyncThunk } from '@redux/redux.helper';
import { denormalisedResponseEntities } from '@utils/data';
import { storableError } from '@utils/errors';
import type { TCompany, TPagination, TUser } from '@utils/types';

export const RESULT_PAGE_SIZE = 10;

export type TCompanyMembers = Record<string, TUser[]>;

type TManageCompanyState = {
  companyRefs: any[];
  queryCompaniesInProgress: boolean;
  queryCompaniesError: any;
  pagination?: TPagination | null;
  updateStatusInProgress: boolean;
  updateStatusError: any;
  totalItems: number;

  companyMembers: TCompanyMembers | null;
  getCompanyMembersInProgress: boolean;
  getCompanyMembersError: any;
};

const QUERY_COMPANIES = 'app/ManageCompanies/QUERY_COMPANIES';
const UPDATE_COMPANY_STATUS = 'app/ManageCompanies/UPDATE_COMPANY_STATUS';

const GET_COMPANY_MEMBER_DETAILS =
  'app/ManageCompanies/GET_COMPANY_MEMBER_DETAILS';

const queryCompanies = createAsyncThunk(
  QUERY_COMPANIES,
  async (page: number | undefined, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data: companies } = await getCompaniesAdminApi();

      return fulfillWithValue({ companies, page });
    } catch (error: any) {
      console.error('Query company error : ', error);

      return rejectWithValue(storableError(error.response.data));
    }
  },
);

const getCompanyMemberDetails = createAsyncThunk(
  GET_COMPANY_MEMBER_DETAILS,
  async (ids: string[], { fulfillWithValue, rejectWithValue }) => {
    try {
      let allMembers: TCompanyMembers = {};
      await Promise.all(
        ids.map(async (id: string) => {
          if (!allMembers[id]) {
            allMembers[id] = [];
          }
          const { data: members = [] } = await getCompanyMembersDetailsApi(id);
          allMembers = {
            ...allMembers,
            [id]: [...allMembers[id], ...members],
          };

          return allMembers;
        }),
      );

      return fulfillWithValue(allMembers);
    } catch (error: any) {
      console.error('Query company error : ', error);

      return rejectWithValue(storableError(error.response.data));
    }
  },
);

const updateCompanyStatus = createAsyncThunk(
  UPDATE_COMPANY_STATUS,
  async (updateData: any, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await updateCompanyStatusApi(updateData);
      const [company] = denormalisedResponseEntities(data);

      return fulfillWithValue(company);
    } catch (error: any) {
      console.error('Update company status error : ', error);

      return rejectWithValue(storableError(error.response.data));
    }
  },
);

export const manageCompaniesThunks = {
  queryCompanies,
  updateCompanyStatus,
  getCompanyMemberDetails,
};

const initialState: TManageCompanyState = {
  companyRefs: [],
  queryCompaniesInProgress: false,
  queryCompaniesError: true,
  updateStatusInProgress: false,
  updateStatusError: null,
  pagination: null,
  totalItems: 0,

  companyMembers: null,
  getCompanyMembersInProgress: false,
  getCompanyMembersError: null,
};

export const manageCompaniesSlice = createSlice({
  name: 'ManageCompaniesPage',
  initialState,
  reducers: {
    paginateCompanies: (state, action) => {
      const { page, totalItems, perPage = 10 } = action.payload;

      return {
        ...state,
        pagination: {
          totalItems,
          totalPages: Math.ceil(totalItems / perPage),
          perPage,
          page,
        },
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(queryCompanies.pending, (state) => ({
        ...state,
        queryCompaniesInProgress: true,
        queryCompaniesError: null,
      }))
      .addCase(queryCompanies.fulfilled, (state, action) => {
        const { companies } = action.payload;

        return {
          ...state,
          companyRefs: companies,
          queryCompaniesInProgress: false,
          totalItems: companies.length,
        };
      })
      .addCase(queryCompanies.rejected, (state, action) => ({
        ...state,
        queryCompaniesError: action.payload,
        queryCompaniesInProgress: false,
      }))
      .addCase(updateCompanyStatus.pending, (state) => ({
        ...state,
        updateStatusInProgress: true,
        updateStatusError: null,
      }))
      .addCase(updateCompanyStatus.fulfilled, (state, action) => {
        const { companyRefs } = state;
        const companies = [...companyRefs];
        const newCompany = action.payload;
        const index = companyRefs.findIndex((company: TCompany) => {
          return company.id.uuid === newCompany.id.uuid;
        });
        companies[index] = newCompany;

        return {
          ...state,
          companyRefs: companies,
          updateStatusInProgress: false,
        };
      })
      .addCase(updateCompanyStatus.rejected, (state, action) => ({
        ...state,
        updateStatusInProgress: false,
        updateStatusError: action.payload,
      }))
      .addCase(getCompanyMemberDetails.pending, (state) => ({
        ...state,
        getCompanyMembersInProgress: true,
        getCompanyMembersError: null,
      }))
      .addCase(getCompanyMemberDetails.fulfilled, (state, { payload }) => ({
        ...state,
        getCompanyMembersInProgress: false,
        companyMembers: payload,
      }))
      .addCase(getCompanyMemberDetails.rejected, (state, { payload }) => ({
        ...state,
        getCompanyMembersInProgress: false,
        getCompanyMembersError: payload,
      }));
  },
});

export const { paginateCompanies } = manageCompaniesSlice.actions;

export default manageCompaniesSlice.reducer;
