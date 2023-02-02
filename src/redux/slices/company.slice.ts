import { fetchUserApi } from '@apis/index';
import { createAsyncThunk } from '@redux/redux.helper';
import { createSlice } from '@reduxjs/toolkit';
import { denormalisedResponseEntities, USER } from '@utils/data';
import type { TObject, TUser } from '@utils/types';
import axios from 'axios';

const MEMBER_PER_PAGE = 10;

type TGroupInfo = {
  id: string;
  name: string;
  description: string;
};

type TCompanyState = {
  groupList: any;
  fetchGroupListInProgress: boolean;
  companyMembers: any[];
  groupMembers: any[];
  groupMembersPagination: any;
  groupInfo: TGroupInfo;
  workspaceCompanyId: string;
  fetchGroupDetailInProgress: boolean;
  fetchCompanyInfoInProgress: boolean;
  createGroupInProgress: boolean;
  createGroupError: any;

  deleteGroupInProgress: boolean;
  deleteGroupError: any;
  deletingGroupId: string;

  company: TUser | null;
  updateGroupInProgress: boolean;
  updateGroupError: any;
  originCompanyMembers: TObject;
  isCompanyNotFound: boolean;
};

// ================ Thunk types ================ //
const COMPANY_INFO = 'app/Company/COMPANY_INFO';
const GROUP_INFO = 'app/Company/GROUP_INFO';
const GROUP_DETAIL_INFO = 'app/Company/GROUP_DETAIL_INFO';
const CREATE_GROUP = 'app/Company/CREATE_GROUP';
const UPDATE_GROUP = 'app/Company/UPDATE_GROUP';
const DELETE_GROUP = 'app/Company/DELETE_GROUP';

const initialState: TCompanyState = {
  groupList: [],
  fetchGroupListInProgress: false,
  groupMembers: [],
  workspaceCompanyId: '',
  groupInfo: {} as TGroupInfo,
  fetchGroupDetailInProgress: false,
  companyMembers: [],
  groupMembersPagination: null,
  fetchCompanyInfoInProgress: false,
  createGroupInProgress: false,
  createGroupError: null,

  deleteGroupInProgress: false,
  deleteGroupError: null,
  deletingGroupId: '',

  company: null,
  updateGroupInProgress: false,
  updateGroupError: null,
  originCompanyMembers: {},
  isCompanyNotFound: false,
};

const companyInfo = createAsyncThunk(COMPANY_INFO, async (_, { getState }) => {
  const { workspaceCompanyId } = getState().company;
  const { data: companyAccount } = await fetchUserApi(workspaceCompanyId);
  const { data: allEmployeesData } = await axios.get(
    `/company/all-employees?companyId=${workspaceCompanyId}`,
  );
  const { groups = [], members = {} } = USER(companyAccount).getMetadata();
  return {
    groupList: groups,
    company: companyAccount,
    originCompanyMembers: members,
    companyMembers: [...allEmployeesData.data.data],
  };
});

const groupInfo = createAsyncThunk(
  GROUP_INFO,
  async (_, { getState, extra: sdk }) => {
    const { workspaceCompanyId } = getState().company;
    const response = await sdk.users.show({ id: workspaceCompanyId });
    const groupsResponse =
      response.data.data?.attributes?.profile?.metadata?.groups;
    return groupsResponse;
  },
);

const groupDetailInfo = createAsyncThunk(
  GROUP_DETAIL_INFO,
  async ({ groupId, page = 1 }: any, { extra: sdk, getState }) => {
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
      `/company/group/all-member?groupId=${groupId}&perPage=${MEMBER_PER_PAGE}&page=${page}`,
    );
    const groupInfoState: TGroupInfo = {
      id,
      name,
      description,
    };
    return {
      groupInfo: groupInfoState,
      groupMembers: [...allMembersData.data.data],
      groupMembersPagination: allMembersData.data.meta,
    };
  },
);

const createGroup = createAsyncThunk(
  CREATE_GROUP,
  async (params: TObject, { getState }) => {
    const { workspaceCompanyId } = getState().company;
    const { data: newCompanyAccount } = await axios.post('/company/group', {
      ...params,
      companyId: workspaceCompanyId,
    });
    const { groups } = newCompanyAccount.attributes.profile.metadata;
    return groups;
  },
);

const updateGroup = createAsyncThunk(
  UPDATE_GROUP,
  async (
    { groupId, groupInfo: groupInfoParams, addedMembers, deletedMembers }: any,
    { getState, dispatch },
  ) => {
    const { workspaceCompanyId } = getState().company;
    await axios.put('/company/group', {
      addedMembers,
      deletedMembers,
      groupId,
      groupInfo: groupInfoParams,
      companyId: workspaceCompanyId,
    });
    return [dispatch(groupDetailInfo({ groupId })), dispatch(groupInfo())];
  },
);

const deleteGroup = createAsyncThunk(
  DELETE_GROUP,
  async (groupId: string, { getState }) => {
    const { workspaceCompanyId } = getState().company;
    const { data: newCompanyAccount } = await axios.delete('/company/group', {
      data: {
        groupId,
        companyId: workspaceCompanyId,
      },
    });
    const { groups } = newCompanyAccount.attributes.profile.metadata;
    return groups;
  },
);

export const BookerManageCompany = {
  companyInfo,
  groupInfo,
  groupDetailInfo,
  createGroup,
  updateGroup,
  deleteGroup,
};

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
      .addCase(companyInfo.pending, (state) => {
        return {
          ...state,
          fetchCompanyInfoInProgress: true,
          isCompanyNotFound: false,
        };
      })
      .addCase(companyInfo.fulfilled, (state, { payload }) => {
        const { groupList, companyMembers, originCompanyMembers, company } =
          payload;
        return {
          ...state,
          groupList,
          companyMembers,
          company,
          originCompanyMembers,
          isCompanyNotFound: false,
          fetchCompanyInfoInProgress: false,
        };
      })
      .addCase(companyInfo.rejected, (state) => {
        return {
          ...state,
          fetchCompanyInfoInProgress: false,
          isCompanyNotFound: true,
        };
      })
      .addCase(groupInfo.pending, (state) => {
        return {
          ...state,
          fetchGroupListInProgress: true,
        };
      })
      .addCase(groupInfo.fulfilled, (state, { payload }) => ({
        ...state,
        groupList: payload,
        fetchGroupListInProgress: false,
      }))
      .addCase(groupDetailInfo.pending, (state) => {
        return {
          ...state,
          fetchGroupDetailInProgress: true,
        };
      })
      .addCase(groupDetailInfo.fulfilled, (state, { payload }) => {
        return {
          ...state,
          groupInfo: payload?.groupInfo,
          groupMembers: payload?.groupMembers,
          fetchGroupDetailInProgress: false,
        };
      })
      .addCase(createGroup.pending, (state) => {
        return {
          ...state,
          createGroupInProgress: true,
          createGroupError: null,
        };
      })
      .addCase(createGroup.fulfilled, (state, { payload }) => {
        return {
          ...state,
          createGroupInProgress: false,
          createGroupError: null,
          groupList: payload,
        };
      })
      .addCase(createGroup.rejected, (state, { error }) => {
        return {
          ...state,
          createGroupInProgress: false,
          createGroupError: error.message,
        };
      })
      .addCase(deleteGroup.pending, (state, { meta }) => {
        const { arg } = meta;
        return {
          ...state,
          deleteGroupInProgress: true,
          deleteGroupError: null,
          deletingGroupId: arg,
        };
      })
      .addCase(deleteGroup.fulfilled, (state, { payload }) => {
        return {
          ...state,
          deleteGroupInProgress: false,
          deleteGroupError: null,
          groupList: payload,
          deletingGroupId: '',
        };
      })
      .addCase(deleteGroup.rejected, (state, { error }) => {
        return {
          ...state,
          deleteGroupInProgress: false,
          deleteGroupError: error.message,
          deletingGroupId: '',
        };
      })
      .addCase(updateGroup.pending, (state) => {
        return {
          ...state,
          updateGroupInProgress: true,
          updateGroupError: null,
        };
      })
      .addCase(updateGroup.fulfilled, (state) => {
        return {
          ...state,
          updateGroupInProgress: false,
        };
      })
      .addCase(updateGroup.rejected, (state, { error }) => {
        return {
          ...state,
          updateGroupInProgress: false,
          updateGroupError: error.message,
        };
      });
  },
});

export const { addWorkspaceCompanyId } = companySlice.actions;

export default companySlice.reducer;
