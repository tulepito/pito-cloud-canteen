import {
  addMembersApi,
  checkEmailExistedApi,
  deleteMemberApi,
} from '@apis/companyApi';
import { queryCompanyMembersApi } from '@apis/index';
import { createAsyncThunk } from '@redux/redux.helper';
import { createSlice } from '@reduxjs/toolkit';
import { storableAxiosError } from '@utils/errors';
import type { TUser } from '@utils/types';

import { companyThunks } from './company.slice';

interface TCompanyMemberState {
  company: TUser | null;
  companyMembers: any[];
  addMembersInProgress: boolean;
  addMembersError: any;

  deleteMemberInProgress: boolean;
  deleteMemberError: any;

  checkedEmailInputChunk: any[];
  checkEmailExistedInProgress: boolean;

  queryMembersInProgress: boolean;
  queryMemberError: any;
}

const initialState: TCompanyMemberState = {
  company: null,
  companyMembers: [],
  addMembersInProgress: false,
  addMembersError: null,

  deleteMemberInProgress: false,
  deleteMemberError: null,

  checkedEmailInputChunk: [],
  checkEmailExistedInProgress: false,

  queryMembersInProgress: false,
  queryMemberError: null,
};

const CHECK_EMAILS_EXISTED = 'app/companyMember/CHECK_EMAILS_EXISTED';
const ADD_MEMBERS = 'app/companyMember/ADD_MEMBERS';
const DELETE_MEMBER = 'app/companyMember/DELETE_MEMBER';
const QUERY_COMPANY_MEMBERS = 'app/companyMember/QUERY_COMPANY_MEMBERS';

const queryCompanyMembers = createAsyncThunk(
  QUERY_COMPANY_MEMBERS,
  async (id: string) => {
    const { data } = await queryCompanyMembersApi(id);
    return data;
  },
  {
    serializeError: storableAxiosError,
  },
);

const checkEmailExisted = createAsyncThunk(
  CHECK_EMAILS_EXISTED,
  async (emailList: string[]) => {
    const response = await Promise.all(
      emailList.map(async (email) => {
        const { data: queryResponse } = await checkEmailExistedApi(email);
        return { email, response: queryResponse };
      }),
    );
    return response;
  },
);

const addMembers = createAsyncThunk(
  ADD_MEMBERS,
  async (params: any, { getState, dispatch }) => {
    const { workspaceCompanyId } = getState().company;
    const { data: addMembersResponse } = await addMembersApi({
      ...params,
      companyId: workspaceCompanyId,
    });
    await dispatch(companyThunks.companyInfo());
    return addMembersResponse;
  },
);

const deleteMember = createAsyncThunk(
  DELETE_MEMBER,
  async (email: string, { getState }) => {
    const { workspaceCompanyId } = getState().company;
    const { data: deleteMemberData } = await deleteMemberApi({
      memberEmail: email,
      companyId: workspaceCompanyId,
    });
    return deleteMemberData;
  },
);

export const companyMemberThunks = {
  addMembers,
  deleteMember,
  checkEmailExisted,
  queryCompanyMembers,
};

export const companyMemberSlice = createSlice({
  name: 'companyMember',
  initialState,
  reducers: {
    resetCheckedEmailInputChunk: (state) => {
      state.checkedEmailInputChunk = [];
    },
    resetError: (state) => {
      state.addMembersError = null;
      state.deleteMemberError = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(checkEmailExisted.pending, (state) => ({
        ...state,
        checkEmailExistedInProgress: true,
      }))
      .addCase(checkEmailExisted.fulfilled, (state, { payload }) => ({
        ...state,
        checkEmailExistedInProgress: false,
        checkedEmailInputChunk: payload,
      }))
      .addCase(checkEmailExisted.rejected, (state) => ({
        ...state,
        checkEmailExistedInProgress: false,
      }))

      .addCase(addMembers.pending, (state) => ({
        ...state,
        addMembersInProgress: true,
        addMembersError: null,
      }))
      .addCase(addMembers.fulfilled, (state) => ({
        ...state,
        addMembersInProgress: false,
      }))
      .addCase(addMembers.rejected, (state, { error }) => ({
        ...state,
        addMembersInProgress: false,
        addMembersError: error.message,
      }))

      .addCase(deleteMember.pending, (state) => ({
        ...state,
        deleteMemberInProgress: true,
        deleteMemberError: null,
      }))
      .addCase(deleteMember.fulfilled, (state) => ({
        ...state,
        deleteMemberInProgress: false,
      }))
      .addCase(deleteMember.rejected, (state, { error }) => ({
        ...state,
        deleteMemberInProgress: false,
        deleteMemberError: error.message,
      }))
      .addCase(queryCompanyMembers.pending, (state) => ({
        ...state,
        queryMembersInProgress: true,
        queryMemberError: null,
      }))
      .addCase(queryCompanyMembers.fulfilled, (state, { payload }) => ({
        ...state,
        queryMembersInProgress: false,
        companyMembers: payload,
      }))
      .addCase(queryCompanyMembers.rejected, (state, { error }) => ({
        ...state,
        queryMemberError: error,
        queryMembersInProgress: false,
      }));
  },
});
export const { resetCheckedEmailInputChunk, resetError } =
  companyMemberSlice.actions;
export default companyMemberSlice.reducer;
