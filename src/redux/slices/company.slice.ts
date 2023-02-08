import type {
  CreateGroupApiBody,
  DeleteGroupApiData,
  GetGroupDetailApiParams,
  UpdateCompanyApiBody,
  UpdateGroupApiBody,
} from '@apis/companyApi';
import {
  createGroupApi,
  deleteGroupApi,
  getGroupDetailApi,
  updateCompany,
  updateGroupApi,
} from '@apis/companyApi';
import { createAsyncThunk } from '@redux/redux.helper';
import { createSlice } from '@reduxjs/toolkit';
import { denormalisedResponseEntities } from '@utils/data';
import { EImageVariants } from '@utils/enums';
import type { TObject, TUser } from '@utils/types';
import axios from 'axios';

import { userThunks } from './user.slice';

export type TCompanyImageActionPayload = {
  id: string;
  file: any;
};

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

  updateCompanyInProgress: boolean;
  updateCompanyError: any;

  updateBookerAccountInProgress: boolean;
  updateBookerAccountError: any;
};

// ================ Thunk types ================ //
const COMPANY_INFO = 'app/Company/COMPANY_INFO';
const GROUP_INFO = 'app/Company/GROUP_INFO';
const GROUP_DETAIL_INFO = 'app/Company/GROUP_DETAIL_INFO';
const CREATE_GROUP = 'app/Company/CREATE_GROUP';
const UPDATE_GROUP = 'app/Company/UPDATE_GROUP';
const DELETE_GROUP = 'app/Company/DELETE_GROUP';
const UPDATE_COMPANY_ACCOUNT = 'app/Company/UPDATE_COMPANY_ACCOUNT';
const UPDATE_BOOKER_ACCOUNT = 'app/Company/UPDATE_BOOKER_ACCOUNT';

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

  updateCompanyInProgress: false,
  updateCompanyError: null,

  updateBookerAccountInProgress: false,
  updateBookerAccountError: null,
};

const companyInfo = createAsyncThunk(
  COMPANY_INFO,
  async (_, { getState, extra: sdk }) => {
    const { workspaceCompanyId } = getState().company;
    const companyAccountResponse = await sdk.users.show({
      id: workspaceCompanyId,
      include: ['profileImage'],
    });
    const [companyAccount] = denormalisedResponseEntities(
      companyAccountResponse,
    );
    const companyImageId = companyAccount.profileImage?.id;
    const { data: allEmployeesData } = await axios.get(
      `/api/company/all-employees?companyId=${workspaceCompanyId}`,
    );
    const { groups = [], members = {} } =
      companyAccount.attributes.profile.metadata;
    return {
      companyImage: {
        imageId: companyImageId || null,
      },
      groupList: groups,
      company: companyAccount,
      originCompanyMembers: members,
      companyMembers: [...allEmployeesData.data.data],
    };
  },
);

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
    const apiParams: GetGroupDetailApiParams = {
      groupId,
      page,
      perPage: MEMBER_PER_PAGE,
    };
    const { data: allMembersData } = await getGroupDetailApi(apiParams);
    const { allMembers, meta } = allMembersData;
    const groupInfoState: TGroupInfo = {
      id,
      name,
      description,
    };
    return {
      groupInfo: groupInfoState,
      groupMembers: allMembers,
      groupMembersPagination: meta,
    };
  },
);

const createGroup = createAsyncThunk(
  CREATE_GROUP,
  async (params: TObject, { getState }) => {
    const { workspaceCompanyId } = getState().company;
    const { groupInfo: groupInforParam, groupMembers } = params;
    const apiBody: CreateGroupApiBody = {
      companyId: workspaceCompanyId,
      groupInfo: groupInforParam,
      groupMembers,
    };
    const { data: newCompanyAccount } = await createGroupApi(apiBody);
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
    const apiBody: UpdateGroupApiBody = {
      addedMembers,
      deletedMembers,
      groupId,
      groupInfo: groupInfoParams,
      companyId: workspaceCompanyId,
    };
    await updateGroupApi(apiBody);
    return [dispatch(groupDetailInfo({ groupId })), dispatch(groupInfo())];
  },
);

const deleteGroup = createAsyncThunk(
  DELETE_GROUP,
  async (groupId: string, { getState }) => {
    const { workspaceCompanyId } = getState().company;
    const apiData: DeleteGroupApiData = {
      groupId,
      companyId: workspaceCompanyId,
    };
    const { data: newCompanyAccount } = await deleteGroupApi(apiData);
    const { groups } = newCompanyAccount.attributes.profile.metadata;
    return groups;
  },
);

const updateBookerAccount = createAsyncThunk(
  UPDATE_BOOKER_ACCOUNT,
  async (params: any, { extra: sdk, dispatch }) => {
    const queryParams = {
      expand: true,
      include: ['profileImage'],
      'fields.image': ['variants.square-small', 'variants.square-small2x'],
    };

    await sdk.currentUser.updateProfile(params, queryParams);
    await dispatch(userThunks.fetchCurrentUser());
    return '';
  },
);

const updateCompanyAccount = createAsyncThunk(
  UPDATE_COMPANY_ACCOUNT,
  async (_, { getState, dispatch }) => {
    const { workspaceCompanyId } = getState().company;
    const { image = {} } = getState().uploadImage;
    const { imageId, file } = image;
    const apiBody: UpdateCompanyApiBody = {
      companyId: workspaceCompanyId,
      dataParams: {
        id: workspaceCompanyId,
        ...(imageId && file ? { profileImageId: imageId.uuid } : {}),
      },
      queryParams: {
        expand: true,
        include: ['profileImage'],
        'fields.image': [
          EImageVariants.squareSmall,
          EImageVariants.squareSmall2x,
          EImageVariants.scaledLarge,
        ],
      },
    };
    const { data: companyAccount } = await updateCompany(apiBody);
    dispatch(companyInfo());
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
  updateCompanyAccount,
  updateBookerAccount,
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
      })
      .addCase(updateCompanyAccount.pending, (state) => {
        return {
          ...state,
          updateCompanyInProgress: true,
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
      })

      .addCase(updateBookerAccount.pending, (state) => {
        return {
          ...state,
          updateBookerAccountInProgress: true,
          updateBookerAccountError: null,
        };
      })
      .addCase(updateBookerAccount.fulfilled, (state) => {
        return {
          ...state,
          updateBookerAccountInProgress: false,
        };
      })
      .addCase(updateBookerAccount.rejected, (state, { error }) => {
        return {
          ...state,
          updateBookerAccountInProgress: false,
          updateBookerAccountError: error.message,
        };
      });
  },
});

export const { addWorkspaceCompanyId } = companySlice.actions;

export default companySlice.reducer;
