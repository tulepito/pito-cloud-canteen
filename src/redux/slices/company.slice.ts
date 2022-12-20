import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { denormalisedResponseEntities } from '@utils/data';
import type { TUser } from '@utils/types';
import axios from 'axios';

import type { ThunkAPI } from './types';

const MEMBER_PER_PAGE = 10;

type TGroupInfo = {
  id: string;
  name: string;
  description: string;
};

export type TCompanyImageActionPayload = {
  id: string;
  file: any;
};
interface CompanyState {
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

  updateGroupInProgress: boolean;
  updateGroupError: any;
  originCompanyMembers: Record<string, any>;

  company: TUser | null;
  companyImage: any;
  uploadCompanyImageInProgress: boolean;
  uploadCompanyImageError: any;
  updateCompanyInProgress: boolean;
  updateCompanyError: any;
}

// ================ Thunk types ================ //
const COMPANY_INFO = 'app/Company/COMPANY_INFO';
const GROUP_INFO = 'app/Company/GROUP_INFO';
const GROUP_DETAIL_INFO = 'app/Company/GROUP_DETAIL_INFO';
const CREATE_GROUP = 'app/Company/CREATE_GROUP';
const UPDATE_GROUP = 'app/Company/UPDATE_GROUP';
const DELETE_GROUP = 'app/Company/DELETE_GROUP';
const UPLOAD_COMPANY_IMAGE = 'app/Company/UPLOAD_COMPANY_IMAGE';
const UPDATE_COMPANY_ACCOUNT = 'app/Company/UPDATE_COMPANY_ACCOUNT';

const initialState: CompanyState = {
  groupList: [],
  fetchGroupListInProgress: false,
  groupMembers: [],
  workspaceCompanyId: '639a9857-879a-4090-97a0-032fa3851542',
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

  updateGroupInProgress: false,
  updateGroupError: null,
  originCompanyMembers: {},

  company: null,
  companyImage: null,
  uploadCompanyImageInProgress: false,
  uploadCompanyImageError: null,
  updateCompanyInProgress: false,
  updateCompanyError: null,
};

const companyInfo = createAsyncThunk(
  COMPANY_INFO,
  async (_, { getState, extra: sdk }: ThunkAPI) => {
    const { workspaceCompanyId } = getState().company;
    const companyAccountResponse = await sdk.users.show({
      id: workspaceCompanyId,
      include: ['profileImage'],
      'fields.image': ['variants.square-small', 'variants.square-small2x'],
    });
    const [companyAccount] = denormalisedResponseEntities(
      companyAccountResponse,
    );
    const { data: allEmployeesData } = await axios.get(
      `/api/company/all-employees?companyId=${workspaceCompanyId}`,
    );
    const companyImageId = companyAccount.profileImage?.id;
    const { groups = [], members = {} } =
      companyAccount.attributes.profile.metadata;
    return {
      companyImage: {
        imageId: companyImageId || null,
      },
      company: companyAccount,
      groupList: groups,
      originCompanyMembers: members,
      companyMembers: [...allEmployeesData.data.data],
    };
  },
);

const groupInfo = createAsyncThunk(
  GROUP_INFO,
  async (_, { getState, extra: sdk }: ThunkAPI) => {
    const { workspaceCompanyId } = getState().company;
    const response = await sdk.users.show({ id: workspaceCompanyId });
    const groupsResponse =
      response.data.data?.attributes?.profile?.metadata?.groups;
    return groupsResponse;
  },
);

const groupDetailInfo = createAsyncThunk(
  GROUP_DETAIL_INFO,
  async ({ groupId, page = 1 }: any, { extra: sdk, getState }: ThunkAPI) => {
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
      `/api/company/group/all-member?groupId=${groupId}&perPage=${MEMBER_PER_PAGE}&page=${page}`,
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
  async (params: any, { getState }: ThunkAPI) => {
    const { workspaceCompanyId } = getState().company;
    const { data: newCompanyAccount } = await axios.post('/api/company/group', {
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
    { getState, dispatch }: ThunkAPI,
  ) => {
    const { workspaceCompanyId } = getState().company;
    await axios.put('/api/company/group', {
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
  async (groupId: string, { getState }: ThunkAPI) => {
    const { workspaceCompanyId } = getState().company;
    const { data: newCompanyAccount } = await axios.delete(
      '/api/company/group',
      {
        data: {
          groupId,
          companyId: workspaceCompanyId,
        },
      },
    );
    const { groups } = newCompanyAccount.attributes.profile.metadata;
    return groups;
  },
);

const uploadCompanyImage = createAsyncThunk(
  UPLOAD_COMPANY_IMAGE,
  async (
    actionPayload: TCompanyImageActionPayload,
    { extra: sdk }: ThunkAPI,
  ) => {
    const { id, file } = actionPayload;
    const bodyParams = {
      image: file,
    };
    const queryParams = {
      expand: true,
      'fields.image': ['variants.square-small', 'variants.square-small2x'],
    };
    const uploadImageResponse = await sdk.images.upload(
      bodyParams,
      queryParams,
    );
    const uploadedImage = uploadImageResponse.data.data;
    return {
      id,
      uploadedImage,
    };
  },
);

const updateCompanyAccount = createAsyncThunk(
  UPDATE_COMPANY_ACCOUNT,
  async ({ companyName }: any, { getState }: ThunkAPI) => {
    const { companyImage, workspaceCompanyId } = getState().company;
    const { imageId, file } = companyImage || {};
    const { data: companyAccount } = await axios.put('/api/company', {
      companyName,
      ...(imageId && file ? { companyImageId: imageId.uuid } : {}),
      companyId: workspaceCompanyId,
    });
    return {
      company: companyAccount,
    };
  },
);
export const BookerManageCompany = {
  companyInfo,
  groupInfo,
  groupDetailInfo,
  createGroup,
  updateGroup,
  deleteGroup,
  uploadCompanyImage,
  updateCompanyAccount,
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
        };
      })
      .addCase(companyInfo.fulfilled, (state, { payload }) => {
        const { groupList, companyMembers, company } = payload;
        return {
          ...state,
          groupList,
          companyMembers,
          company,
          fetchCompanyInfoInProgress: false,
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
      })
      .addCase(uploadCompanyImage.pending, (state, { meta }) => {
        const { arg } = meta;
        return {
          ...state,
          uploadCompanyImageInProgress: true,
          uploadCompanyImageError: null,
          companyImage: { ...arg },
        };
      })
      .addCase(uploadCompanyImage.fulfilled, (state, { payload }) => {
        const { id, uploadedImage } = payload;
        const { file } = state.companyImage || {};
        const companyImage = {
          id,
          imageId: uploadedImage.id,
          file,
          uploadedImage,
        };
        return {
          ...state,
          uploadCompanyImageInProgress: false,
          companyImage,
        };
      })
      .addCase(uploadCompanyImage.rejected, (state, { error }) => {
        return {
          ...state,
          uploadCompanyImageInProgress: false,
          companyImage: null,
          uploadCompanyImageError: error.message,
        };
      })
      .addCase(updateCompanyAccount.pending, (state) => {
        return {
          ...state,
          updateCompanyInProgress: false,
        };
      })
      .addCase(updateCompanyAccount.fulfilled, (state, { payload }) => {
        const { company } = payload;
        return {
          ...state,
          updateCompanyInProgress: false,
          company,
        };
      })
      .addCase(updateCompanyAccount.rejected, (state, { error }) => {
        return {
          ...state,
          updateCompanyInProgress: false,
          updateCompanyError: error.message,
        };
      });
  },
});

export const { addWorkspaceCompanyId } = companySlice.actions;

export default companySlice.reducer;
