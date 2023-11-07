/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/no-shadow */
import { createSlice } from '@reduxjs/toolkit';
import chunk from 'lodash/chunk';
import flatten from 'lodash/flatten';
import isEmpty from 'lodash/isEmpty';

import { verifyEmailApi } from '@apis/admin';
import type {
  CreateGroupApiBody,
  DeleteGroupApiData,
  GetGroupDetailApiParams,
  TAdminTransferCompanyOwnerParams,
  UpdateCompanyApiBody,
  UpdateGroupApiBody,
} from '@apis/companyApi';
import {
  adminCreateGroupApi,
  adminDeleteGroupApi,
  adminTransferCompanyOwnerApi,
  adminUpdateGroupApi,
  createGroupApi,
  deleteGroupApi,
  fetchCompanyInfo,
  getAllCompanyMembersApi,
  getGroupDetailApi,
  updateCompany,
  updateGroupApi,
} from '@apis/companyApi';
import {
  adminUpdateCompanyApi,
  createCompanyApi,
  getCompaniesAdminApi,
  publishCompanyApi,
  showCompanyApi,
  unActiveCompanyApi,
} from '@apis/index';
import { createAsyncThunk } from '@redux/redux.helper';
import { denormalisedResponseEntities, User } from '@utils/data';
import { ECompanyStates, EImageVariants } from '@utils/enums';
import { storableAxiosError, storableError } from '@utils/errors';
import type {
  TCompany,
  TCreateCompanyApiParams,
  TImage,
  TObject,
  TPagination,
  TUpdateCompanyApiParams,
  TUser,
} from '@utils/types';

import { companyMemberThunks } from './companyMember.slice';
import { userThunks } from './user.slice';

export const COMPANY_LOGO_VARIANTS = [EImageVariants.default];

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
  showCompanyInProgress: boolean;
  showCompanyError: any;

  updateGroupInProgress: boolean;
  updateGroupError: any;
  originCompanyMembers: TObject;
  isCompanyNotFound: boolean;

  updateCompanyInProgress: boolean;
  updateCompanyError: any;

  updateBookerAccountInProgress: boolean;
  updateBookerAccountError: any;

  createCompanyInProgress: boolean;
  createCompanyError: any;

  uploadedCompanyLogo: TImage | null | { id: string; file: File };
  uploadingCompanyLogo: boolean;
  uploadCompanyLogoError: any;
  favoriteRestaurants: any[];
  favoriteFood: any[];

  transferCompanyOwnerInProgress: boolean;
  transferCompanyOwnerError: any;

  companyRefs: any[];
  queryCompaniesInProgress: boolean;
  queryCompaniesError: any;
  pagination?: TPagination | null;
  totalItems: number;

  adminUpdateCompanyStateInProgress: boolean;
  adminUpdateCompanyStateError: any;
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
const ADMIN_CREATE_COMPANY = 'app/Company/ADMIN_CREATE_COMPANY';
const SHOW_COMPANY = 'app/UpdateCompanyPage/SHOW_COMPANY';
const ADMIN_UPDATE_COMPANY = 'app/UpdateCompanyPage/ADMIN_UPDATE_COMPANY';
const REQUEST_UPLOAD_COMPANY_LOGO =
  'app/UpdateCompanyPage/REQUEST_UPLOAD_COMPANY_LOGO';
const ADMIN_DELETE_GROUP = 'app/Company/ADMIN_DELETE_GROUP';
const ADMIN_CREATE_GROUP = 'app/Company/ADMIN_CREATE_GROUP';
const ADMIN_UPDATE_GROUP = 'app/Company/ADMIN_UPDATE_GROUP';
const ADMIN_TRANSFER_COMPANY_OWNER = 'app/Company/ADMIN_TRANSFER_COMPANY_OWNER';

const ADMIN_QUERY_COMPANIES = 'app/ManageCompanies/ADMIN_QUERY_COMPANIES';
const ADMIN_UPDATE_COMPANY_STATE =
  'app/ManageCompanies/ADMIN_UPDATE_COMPANY_STATE';

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
  showCompanyInProgress: false,
  showCompanyError: null,

  updateGroupInProgress: false,
  updateGroupError: null,
  originCompanyMembers: {},
  isCompanyNotFound: false,

  updateCompanyInProgress: false,
  updateCompanyError: null,

  updateBookerAccountInProgress: false,
  updateBookerAccountError: null,

  createCompanyInProgress: false,
  createCompanyError: null,

  uploadedCompanyLogo: null,
  uploadCompanyLogoError: null,
  uploadingCompanyLogo: false,
  favoriteRestaurants: [],
  favoriteFood: [],

  transferCompanyOwnerInProgress: false,
  transferCompanyOwnerError: null,
  companyRefs: [],
  queryCompaniesInProgress: false,
  queryCompaniesError: undefined,
  adminUpdateCompanyStateInProgress: false,
  adminUpdateCompanyStateError: undefined,
  totalItems: 0,
};

const requestUploadCompanyLogo = createAsyncThunk(
  REQUEST_UPLOAD_COMPANY_LOGO,
  async (payload: any, { extra: sdk, fulfillWithValue, rejectWithValue }) => {
    const { file, id } = payload || {};
    try {
      const response = await sdk.images.upload(
        { image: file },
        {
          expand: true,
          'fields.image': [`variants.${EImageVariants.default}`],
        },
      );
      const img = response.data.data;

      return fulfillWithValue({ ...img, id, imageId: img.id });
    } catch (error) {
      console.error('error', error);

      return rejectWithValue({ id, error: storableError(error) });
    }
  },
);

const adminCreateCompany = createAsyncThunk(
  ADMIN_CREATE_COMPANY,
  async (
    userData: TCreateCompanyApiParams,
    { fulfillWithValue, rejectWithValue },
  ) => {
    try {
      const { data } = await createCompanyApi({
        dataParams: userData,
        queryParams: {
          expand: true,
        },
      });

      const [company] = denormalisedResponseEntities(data);
      const companyId = User(company).getId();
      verifyEmailApi(companyId);

      return fulfillWithValue(company);
    } catch (error: any) {
      console.error(error);

      return rejectWithValue(storableError(error.response.data));
    }
  },
);

const showCompany = createAsyncThunk(
  SHOW_COMPANY,
  async (id: string, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await showCompanyApi(id);
      const [company] = denormalisedResponseEntities(data);

      return fulfillWithValue(company);
    } catch (error: any) {
      console.error('show company error', error);

      return rejectWithValue(storableError(error.response.data));
    }
  },
);

const adminUpdateCompany = createAsyncThunk(
  ADMIN_UPDATE_COMPANY,
  async (params: TUpdateCompanyApiParams) => {
    const { data } = await adminUpdateCompanyApi({
      dataParams: params,
      queryParams: {
        include: ['profileImage'],
        expand: true,
      },
    });

    const [company] = denormalisedResponseEntities(data);

    return company;
  },
  {
    serializeError: storableAxiosError,
  },
);

const companyInfo = createAsyncThunk(
  COMPANY_INFO,
  async (_, { getState, extra: sdk }) => {
    const { workspaceCompanyId } = getState().company;
    const { data: company } = await fetchCompanyInfo(workspaceCompanyId);
    const companyImageId = company.profileImage?.id;
    const { data: companyMembers } = await getAllCompanyMembersApi(
      workspaceCompanyId,
    );
    const { favoriteRestaurantList = [], favoriteFoodList = [] } =
      User(company).getPublicData();
    const { groups = [], members = {} } = User(company).getMetadata();

    // TODO: query restaurants
    const favoriteRestaurants = isEmpty(favoriteRestaurantList)
      ? []
      : flatten(
          await Promise.all(
            chunk<string>(favoriteRestaurantList, 100).map(async (ids) => {
              return denormalisedResponseEntities(
                await sdk.listings.query({
                  ids,
                }),
              );
            }),
          ),
        );

    // TODO: query food
    const favoriteFood = isEmpty(favoriteFoodList)
      ? []
      : flatten(
          await Promise.all(
            chunk<string>(favoriteFoodList, 100).map(async (ids) => {
              return denormalisedResponseEntities(
                await sdk.listings.query({
                  ids,
                }),
              );
            }),
          ),
        );

    return {
      companyImage: {
        imageId: companyImageId || null,
      },
      groupList: groups,
      company,
      originCompanyMembers: members,
      companyMembers,
      favoriteRestaurants,
      favoriteFood,
    };
  },
);

const groupInfo = createAsyncThunk(
  GROUP_INFO,
  async (_, { getState, extra: sdk }) => {
    const { workspaceCompanyId } = getState().company;
    const response = await sdk.users.show({ id: workspaceCompanyId });
    const groupsResponse =
      response.data.data?.attributes?.profile?.metadata?.groups || [];

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
    const {
      id,
      name,
      members = [],
      description,
    } = groups.find((_group: any) => _group.id === groupId);

    const apiParams: GetGroupDetailApiParams = {
      memberIds: members.map((m: TObject) => m.id),
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
  async (params: any, { dispatch }) => {
    await dispatch(userThunks.updateProfile(params));

    return '';
  },
);

const updateCompanyAccount = createAsyncThunk(
  UPDATE_COMPANY_ACCOUNT,
  async (params: any, { getState, dispatch }) => {
    const { workspaceCompanyId } = getState().company;
    const { image = {} } = getState().uploadImage;
    const { imageId, file } = image || {};
    const apiBody: UpdateCompanyApiBody = {
      companyId: workspaceCompanyId,
      dataParams: {
        id: workspaceCompanyId,
        ...params,
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

const adminDeleteGroup = createAsyncThunk(
  ADMIN_DELETE_GROUP,
  async (params: { companyId: string; groupId: string }, { dispatch }) => {
    const { companyId, groupId } = params;
    const apiData: DeleteGroupApiData = {
      groupId,
      companyId,
    };
    const { data } = await adminDeleteGroupApi(apiData);

    dispatch(companyMemberThunks.queryCompanyMembers(companyId));

    return data;
  },
  {
    serializeError: storableAxiosError,
  },
);

const adminCreateGroup = createAsyncThunk(
  ADMIN_CREATE_GROUP,
  async (params: CreateGroupApiBody, { dispatch }) => {
    const { data: newCompanyAccount } = await adminCreateGroupApi(params);
    dispatch(companyMemberThunks.queryCompanyMembers(params.companyId));

    return newCompanyAccount;
  },
  {
    serializeError: storableAxiosError,
  },
);

const adminUpdateGroup = createAsyncThunk(
  ADMIN_UPDATE_GROUP,
  async (params: UpdateGroupApiBody, { dispatch }) => {
    const { addedMembers, deletedMembers, groupId, companyId, groupInfo } =
      params;
    const apiBody: UpdateGroupApiBody = {
      addedMembers,
      deletedMembers,
      groupId,
      companyId,
      groupInfo,
    };
    const { data } = await adminUpdateGroupApi(apiBody);
    dispatch(companyMemberThunks.queryCompanyMembers(companyId));

    return data;
  },
  {
    serializeError: storableAxiosError,
  },
);

const adminTransferCompanyOwner = createAsyncThunk(
  ADMIN_TRANSFER_COMPANY_OWNER,
  async (
    {
      profileImage,
      newOwnerEmail,
      companyId,
      permissionForOldOwner,
    }: TAdminTransferCompanyOwnerParams & { profileImage?: TImage },
    { dispatch, extra: sdk },
  ) => {
    let newOwnerProfileImageId;
    if (profileImage) {
      const response = await fetch(
        profileImage?.attributes?.variants?.[EImageVariants.default]?.url,
      );
      const data = await response.blob();
      const metadata = {
        type: 'image/jpeg',
      };
      const file = new File(
        [data],
        `${`${companyId}_${new Date().getTime()}`}.jpg`,
        metadata,
      );

      const uploadRes = await sdk.images.upload({
        image: file,
      });
      newOwnerProfileImageId = uploadRes.data.data.id;
    }

    const { data: newCompany } = await adminTransferCompanyOwnerApi({
      newOwnerEmail,
      newOwnerProfileImageId,
      permissionForOldOwner,
      companyId,
    });

    await dispatch(companyMemberThunks.queryCompanyMembers(companyId));

    return newCompany;
  },
  {
    serializeError: storableAxiosError,
  },
);

const adminQueryCompanies = createAsyncThunk(
  ADMIN_QUERY_COMPANIES,
  async (
    { queryParams, page }: { queryParams?: TObject; page?: number },
    { fulfillWithValue, rejectWithValue },
  ) => {
    try {
      const { data: companies } = await getCompaniesAdminApi(queryParams);

      return fulfillWithValue({ companies, page });
    } catch (error: any) {
      console.error('Query company error : ', error);

      return rejectWithValue(storableError(error.response.data));
    }
  },
);

const adminUpdateCompanyState = createAsyncThunk(
  ADMIN_UPDATE_COMPANY_STATE,
  async (updateData: any, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { id, userState } = updateData;
      const isPublish = userState === ECompanyStates.published;
      const { data } = isPublish
        ? await publishCompanyApi(id, { expand: true })
        : await unActiveCompanyApi(id, { expand: true });

      const [company] = denormalisedResponseEntities(data);

      return fulfillWithValue(company);
    } catch (error: any) {
      console.error('Update company status error : ', error);

      return rejectWithValue(storableError(error.response.data));
    }
  },
);

export const companyThunks = {
  companyInfo,
  groupInfo,
  groupDetailInfo,
  createGroup,
  updateGroup,
  deleteGroup,
  updateCompanyAccount,
  updateBookerAccount,
  adminCreateCompany,
  adminUpdateCompany,
  showCompany,
  requestUploadCompanyLogo,
  adminCreateGroup,
  adminUpdateGroup,
  adminDeleteGroup,
  adminTransferCompanyOwner,
  adminQueryCompanies,
  adminUpdateCompanyState,
};

export const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    clearStates: () => initialState,
    clearTransferOwnerError: (state) => ({
      ...state,
      transferCompanyOwnerError: null,
    }),
    addWorkspaceCompanyId: (state, { payload }) => {
      return {
        ...state,
        workspaceCompanyId: payload,
      };
    },
    clearError: (state) => ({
      ...state,
      createCompanyError: null,
      updateCompanyError: null,
    }),
    removeCompanyLogo: (state) => ({
      ...state,
      uploadedCompanyLogo: null,
    }),
    renewCompanyState: (state, { payload }) => {
      return {
        ...state,
        company: payload,
      };
    },
    resetCompanySliceStates: () => ({
      ...initialState,
    }),
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
      .addCase(companyInfo.pending, (state) => {
        return {
          ...state,
          fetchCompanyInfoInProgress: true,
          isCompanyNotFound: false,
        };
      })
      .addCase(companyInfo.fulfilled, (state, { payload }) => {
        const {
          groupList,
          companyMembers,
          originCompanyMembers,
          company,
          favoriteRestaurants,
          favoriteFood,
        } = payload;

        return {
          ...state,
          groupList,
          companyMembers,
          company,
          originCompanyMembers,
          favoriteRestaurants,
          favoriteFood,
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
      })
      .addCase(adminCreateCompany.pending, (state) => ({
        ...state,
        createCompanyInProgress: true,
        createCompanyError: null,
      }))
      .addCase(adminCreateCompany.fulfilled, (state, { payload }) => ({
        ...state,
        createCompanyInProgress: false,
        company: payload,
      }))
      .addCase(adminCreateCompany.rejected, (state, action) => ({
        ...state,
        createCompanyInProgress: false,
        createCompanyError: action.payload,
      }))
      .addCase(showCompany.pending, (state) => {
        return {
          ...state,
          showCompanyInProgress: true,
          showCom: null,
        };
      })
      .addCase(showCompany.fulfilled, (state, action) => {
        return {
          ...state,
          company: action.payload,
          showCompanyInProgress: false,
        };
      })
      .addCase(showCompany.rejected, (state, action) => {
        return {
          ...state,
          showCompanyInProgress: false,
          showCompanyError: action.payload,
        };
      })
      .addCase(adminUpdateCompany.pending, (state) => {
        return {
          ...state,
          updateCompanyInProgress: true,
        };
      })
      .addCase(adminUpdateCompany.fulfilled, (state, { payload }) => {
        return {
          ...state,
          updateCompanyInProgress: false,
          company: payload,
        };
      })
      .addCase(adminUpdateCompany.rejected, (state, { error }) => {
        return {
          ...state,
          updateCompanyInProgress: false,
          updateCompanyError: error.message,
        };
      })
      .addCase(requestUploadCompanyLogo.pending, (state, { meta }) => {
        const { id, file } = meta.arg;

        return {
          ...state,
          uploadedCompanyLogo: { id, file },
          uploadingCompanyLogo: true,
          uploadCompanyLogoError: null,
        };
      })
      .addCase(requestUploadCompanyLogo.fulfilled, (state, { payload }) => {
        return {
          ...state,
          uploadingCompanyLogo: false,
          uploadedCompanyLogo: payload,
        };
      })
      .addCase(requestUploadCompanyLogo.rejected, (state, { payload }) => ({
        ...state,
        uploadingCompanyLogo: false,
        uploadCompanyLogoError: payload,
      }))
      .addCase(adminDeleteGroup.pending, (state, { meta }) => {
        const { groupId } = meta.arg;

        return {
          ...state,
          deleteGroupInProgress: true,
          deleteGroupError: null,
          deletingGroupId: groupId,
        };
      })
      .addCase(adminDeleteGroup.fulfilled, (state, { payload }) => {
        return {
          ...state,
          deleteGroupInProgress: false,
          deleteGroupError: null,
          deletingGroupId: '',
          company: payload,
        };
      })
      .addCase(adminDeleteGroup.rejected, (state, { error }) => {
        return {
          ...state,
          deleteGroupInProgress: false,
          deleteGroupError: error.message,
          deletingGroupId: '',
        };
      })
      .addCase(adminCreateGroup.pending, (state) => {
        return {
          ...state,
          createGroupInProgress: true,
          createGroupError: null,
        };
      })
      .addCase(adminCreateGroup.fulfilled, (state, { payload }) => {
        return {
          ...state,
          createGroupInProgress: false,
          createGroupError: null,
          company: payload,
        };
      })
      .addCase(adminCreateGroup.rejected, (state, { error }) => {
        return {
          ...state,
          createGroupInProgress: false,
          createGroupError: error.message,
        };
      })
      .addCase(adminUpdateGroup.pending, (state) => {
        return {
          ...state,
          updateGroupInProgress: true,
          updateGroupError: null,
        };
      })
      .addCase(adminUpdateGroup.fulfilled, (state, { payload }) => {
        return {
          ...state,
          updateGroupInProgress: false,
          company: payload,
        };
      })
      .addCase(adminUpdateGroup.rejected, (state, { error }) => {
        return {
          ...state,
          updateGroupInProgress: false,
          updateGroupError: error.message,
        };
      })
      .addCase(adminTransferCompanyOwner.pending, (state) => {
        return {
          ...state,
          transferCompanyOwnerInProgress: true,
          transferCompanyOwnerError: null,
        };
      })
      .addCase(adminTransferCompanyOwner.fulfilled, (state, { payload }) => {
        return {
          ...state,
          transferCompanyOwnerInProgress: false,
          transferCompanyOwnerError: null,
          company: payload,
        };
      })
      .addCase(adminTransferCompanyOwner.rejected, (state, { error }) => {
        return {
          ...state,
          transferCompanyOwnerInProgress: false,
          transferCompanyOwnerError: error,
        };
      })
      .addCase(adminUpdateCompanyState.pending, (state) => ({
        ...state,
        adminUpdateCompanyStateInProgress: true,
        adminUpdateCompanyStateError: null,
      }))
      .addCase(adminUpdateCompanyState.fulfilled, (state, action) => {
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
          adminUpdateCompanyStateInProgress: false,
        };
      })
      .addCase(adminUpdateCompanyState.rejected, (state, { error }) => ({
        ...state,
        adminUpdateCompanyStateInProgress: false,
        adminUpdateCompanyStateError: error,
      }))
      .addCase(adminQueryCompanies.pending, (state) => ({
        ...state,
        queryCompaniesInProgress: true,
        queryCompaniesError: null,
      }))
      .addCase(adminQueryCompanies.fulfilled, (state, action) => {
        const { companies } = action.payload;

        return {
          ...state,
          companyRefs: companies,
          queryCompaniesInProgress: false,
          totalItems: companies.length,
        };
      })
      .addCase(adminQueryCompanies.rejected, (state, action) => ({
        ...state,
        queryCompaniesError: action.payload,
        queryCompaniesInProgress: false,
      }));
  },
});

export const {
  clearStates,
  addWorkspaceCompanyId,
  resetCompanySliceStates,
  paginateCompanies,
  clearTransferOwnerError,
} = companySlice.actions;

export default companySlice.reducer;
