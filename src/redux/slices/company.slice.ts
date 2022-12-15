import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { denormalisedResponseEntities } from '@utils/data';
import axios from 'axios';

import type { ThunkAPI } from './types';

type TGroupInfo = {
  id: string;
  name: string;
  description: string;
};
interface CompanyState {
  groupList: any;
  fetchGroupListInProgress: boolean;
  groupMembers: any[];
  groupInfo: TGroupInfo;
  workspaceCompanyId: string;
}

// ================ Thunk types ================ //
const GROUP_INFO = 'app/Company/GROUP_INFO';
const GROUP_DETAIL_INFO = 'app/Company/GROUP_DETAIL_INFO';
const CREATE_GROUP = 'app/Company/CREATE_GROUP';
const UPDATE_GROUP = 'app/Company/UPDATE_GROUP';
const DELETE_GROUP = 'app/Company/DELETE_GROUP';

const initialState: CompanyState = {
  groupList: [],
  fetchGroupListInProgress: false,
  groupMembers: [],
  workspaceCompanyId: '639a9857-879a-4090-97a0-032fa3851542',
  groupInfo: {} as TGroupInfo,
};

export const groupInfo = createAsyncThunk(
  GROUP_INFO,
  async (_, { getState, extra: sdk }: ThunkAPI) => {
    const { workspaceCompanyId } = getState().company;
    const response = await sdk.users.show({ id: workspaceCompanyId });
    const groupsResponse =
      response.data.data?.attributes?.profile?.metadata?.groups;
    return groupsResponse;
  },
);

export const groupDetailInfo = createAsyncThunk(
  GROUP_DETAIL_INFO,
  async (
    { groupId }: { groupId: string },
    { extra: sdk, getState }: ThunkAPI,
  ) => {
    const { workspaceCompanyId } = getState().company;
    const companyAccountResponse = await sdk.users.show({
      id: workspaceCompanyId,
    });
    const [companyAccount] = denormalisedResponseEntities(
      companyAccountResponse,
    );
    const { groups = [] } = companyAccount.attributes.profile.metadata;
    const { id, name, description } = groups.find(
      (_group: any) => _group.id === groupId,
    );
    const { data: allMembersData } = await axios.get(
      `/api/company/group/all-member?groupId=${groupId}`,
    );
    const groupInfoState: TGroupInfo = {
      id,
      name,
      description,
    };
    return {
      groupInfo: groupInfoState,
      groupMembers: [...allMembersData.data.data],
    };
  },
);

export const createGroup = createAsyncThunk(
  CREATE_GROUP,
  async (params: any) => {
    try {
      const { data } = await axios.post('/api/company/group', {
        ...params,
      });
      return data;
    } catch (error) {
      //
    }
  },
);

export const updateGroup = createAsyncThunk(
  UPDATE_GROUP,
  async (params: any) => {
    try {
      const { data } = await axios.put('/api/company/group', {
        ...params,
      });
      return data;
    } catch (error) {
      //
    }
  },
);

export const deleteGroup = createAsyncThunk(
  DELETE_GROUP,
  async (groupId: string) => {
    try {
      const { data } = await axios.delete('/api/company/group', {
        data: {
          groupId,
        },
      });
      return data;
    } catch (error) {
      //
    }
  },
);

export const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    addWorkspaceCompanyId: (state, { payload }) => {
      return {
        ...state,
        workspaceCompanyId: payload,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(groupInfo.pending, (state) => {
        return {
          ...state,
          fetchGroupListInProgress: true,
        };
      })
      .addCase(groupInfo.fulfilled, (state, { payload }) => {
        return {
          ...state,
          groupList: payload,
          fetchGroupListInProgress: false,
        };
      })
      .addCase(groupDetailInfo.fulfilled, (state, { payload }) => {
        return {
          ...state,
          groupInfo: payload?.groupInfo,
          groupMembers: payload?.groupMembers,
        };
      });
  },
});

export const { addWorkspaceCompanyId } = companySlice.actions;

export default companySlice.reducer;
