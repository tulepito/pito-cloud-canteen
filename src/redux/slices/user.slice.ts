/* eslint-disable unused-imports/no-unused-vars */
import { createSlice } from '@reduxjs/toolkit';
import chunk from 'lodash/chunk';
import flatten from 'lodash/flatten';

import { mapUserPermissionByRole } from '@components/RoleSelectModal/helpers/mapUserPermissionByRole';
import Tracker from '@helpers/tracker';
import { createAsyncThunk, createDeepEqualSelector } from '@redux/redux.helper';
import type { RootState } from '@redux/store';
import {
  CurrentUser,
  denormalisedResponseEntities,
  ensureCurrentUser,
} from '@utils/data';
import {
  ECompanyPermission,
  EImageVariants,
  EUserRole,
  EUserSystemPermission,
} from '@utils/enums';
import { storableError } from '@utils/errors';
import type { TCurrentUser, TObject } from '@utils/types';

const mergeCurrentUser = (
  oldCurrentUser: TCurrentUser | null,
  newCurrentUser: TCurrentUser | null,
) => {
  const {
    id: oId,
    type: oType,
    attributes: oAttr,
    ...oldRelationships
  } = oldCurrentUser || {};
  const { id, type, attributes, ...relationships } = newCurrentUser || {};

  // Passing null will remove currentUser entity.
  // Only relationships are merged.
  // TODO figure out if sparse fields handling needs a better handling.
  return (
    newCurrentUser === null
      ? null
      : oldCurrentUser === null
      ? newCurrentUser
      : { id, type, attributes, ...oldRelationships, ...relationships }
  ) as TCurrentUser | null;
};

const detectUserPermission = (currentUser: TCurrentUser) => {
  const {
    isAdmin = false,
    isPartner = false,
    isCompany = false,
    company,
  } = CurrentUser(currentUser).getMetadata();

  let isBooker;

  if (!company) {
    isBooker = false;
  } else {
    isBooker = Object.values(company).some(({ permission }: any) => {
      return permission === ECompanyPermission.booker;
    });
  }

  if (isAdmin) return EUserSystemPermission.admin;
  if (isPartner) return EUserSystemPermission.partner;
  if (isCompany || isBooker) return EUserSystemPermission.company;

  return EUserSystemPermission.normal;
};

const getRoles = (currentUser: TCurrentUser) => {
  const {
    isAdmin = false,
    isPartner = false,
    isCompany = false,
    company = {},
  } = CurrentUser(currentUser).getMetadata();

  const isBooker = Object.values(company).some(({ permission }: any) => {
    return permission === ECompanyPermission.booker;
  });

  if (isAdmin) return [EUserRole.admin];
  if (isPartner) return [EUserRole.partner];
  if (isCompany || isBooker) return [EUserRole.booker, EUserRole.participant];

  return [EUserRole.participant];
};

type TUserState = {
  currentUser: TCurrentUser | null;
  currentUserShowError: any;
  userPermission: EUserSystemPermission;
  sendVerificationEmailInProgress: boolean;
  sendVerificationEmailError: any;
  favoriteRestaurants: any[];
  favoriteFood: any[];

  updateProfileInProgress: boolean;
  updateProfileError: any;

  roles: EUserRole[];
  currentRole: EUserRole;
  isRoleSelectModalOpen: boolean;
};

const initialState: TUserState = {
  currentUser: null,
  currentUserShowError: null,
  userPermission: EUserSystemPermission.normal,
  sendVerificationEmailInProgress: false,
  sendVerificationEmailError: null,
  favoriteRestaurants: [],
  favoriteFood: [],

  updateProfileInProgress: false,
  updateProfileError: null,

  roles: [],
  currentRole: null!,
  isRoleSelectModalOpen: false,
};

// ================ Thunks ================ //
const fetchCurrentUser = createAsyncThunk(
  'app/user/FETCH_CURRENT_USER',
  async (params: TObject | undefined, { extra: sdk, rejectWithValue }) => {
    const { userRole } = params || {};
    const parameters = {
      ...params,
      include: ['profileImage'],
      'fields.image': [
        `variants.${EImageVariants.squareSmall}`,
        `variants.${EImageVariants.squareSmall2x}`,
        `variants.${EImageVariants.scaledLarge}`,
      ],
    };
    const response = await sdk.currentUser.show(parameters);
    const entities = denormalisedResponseEntities(response);

    if (entities.length !== 1) {
      return rejectWithValue(
        new Error('Expected a resource in the sdk.currentUser.show response'),
      );
    }

    const currentUser = entities[0];
    Tracker.setUser({
      id: currentUser.id.uuid,
      name: currentUser.attributes.profile.firstName,
      email: currentUser.attributes.email,
    });

    const { favoriteRestaurantList = [], favoriteFoodList = [] } =
      CurrentUser(currentUser).getPublicData();

    const favoriteRestaurants = flatten(
      await Promise.all(
        chunk<string>(favoriteRestaurantList, 100).map(async (restaurantIds) =>
          denormalisedResponseEntities(
            await sdk.listings.query({ ids: restaurantIds }),
          ),
        ),
      ),
    );

    const favoriteFood = flatten(
      await Promise.all(
        chunk<string>(favoriteFoodList, 100).map(async (restaurantIds) =>
          denormalisedResponseEntities(
            await sdk.listings.query({ ids: restaurantIds }),
          ),
        ),
      ),
    );

    const userPermission = userRole ? mapUserPermissionByRole(userRole) : null;

    return {
      currentUser,
      favoriteRestaurants,
      favoriteFood,
      userRole,
      userPermission,
    };
  },
  {
    serializeError: storableError,
  },
);

const sendVerificationEmail = createAsyncThunk(
  'app/user/SEND_VERIFICATION_EMAIL',
  async (_, { extra: sdk }) => {
    await sdk.currentUser.sendVerificationEmail();
  },
  {
    serializeError: storableError,
  },
);

const updateProfile = createAsyncThunk(
  'app/user/UPDATE_PROFILE',
  async (payload: TObject, { extra: sdk }) => {
    const currentUserResponse = await sdk.currentUser.updateProfile(payload, {
      expand: true,
    });

    return denormalisedResponseEntities(currentUserResponse)[0];
  },
);

export const userThunks = {
  fetchCurrentUser,
  sendVerificationEmail,
  updateProfile,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearCurrentUser: (state) => {
      return {
        ...state,
        currentUser: null,
        currentUserShowError: null,
        userPermission: EUserSystemPermission.normal,
        sendVerificationEmailInProgress: false,
        sendVerificationEmailError: null,
        currentRole: null!,
        roles: [],
      };
    },
    setRole: (state, action) => {
      return {
        ...state,
        currentRole: action.payload,
      };
    },
    setUserPermission: (state, action) => {
      return {
        ...state,
        userPermission: action.payload,
      };
    },
    setIsRoleSelectModalOpen: (state, action) => {
      return {
        ...state,
        isRoleSelectModalOpen: action.payload,
      };
    },
    logout: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.currentUserShowError = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        const {
          currentUser,
          favoriteRestaurants,
          favoriteFood,
          userPermission,
        } = action.payload;

        state.currentUser = mergeCurrentUser(state.currentUser, currentUser);
        state.userPermission =
          userPermission || detectUserPermission(currentUser);
        state.roles = getRoles(currentUser);
        state.favoriteRestaurants = favoriteRestaurants;
        state.favoriteFood = favoriteFood;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.currentUserShowError = action.payload;
      })

      .addCase(sendVerificationEmail.pending, (state) => {
        state.sendVerificationEmailInProgress = true;
      })
      .addCase(sendVerificationEmail.fulfilled, (state) => {
        state.sendVerificationEmailInProgress = false;
      })
      .addCase(sendVerificationEmail.rejected, (state, action) => {
        return {
          ...state,
          sendVerificationEmailInProgress: false,
          sendVerificationEmailError: action,
        };
      })
      /* =============== updateProfile =============== */
      .addCase(updateProfile.pending, (state) => {
        state.updateProfileInProgress = true;
        state.updateProfileError = false;
      })
      .addCase(updateProfile.fulfilled, (state, { payload }) => {
        state.updateProfileInProgress = false;
        state.currentUser = payload;
      })
      .addCase(updateProfile.rejected, (state) => {
        state.updateProfileInProgress = false;
        state.updateProfileError = true;
      });
  },
});

export const userActions = userSlice.actions;
export default userSlice.reducer;

// ================ Selectors ================ //
export const currentUserSelector = createDeepEqualSelector(
  (state: RootState) => state.user.currentUser,
  (currentUser) => ensureCurrentUser(currentUser),
);

export const hasCurrentUserErrorsSelector = (state: RootState) => {
  return state.user.currentUserShowError;
};

export const verificationSendingInProgress = (state: RootState) => {
  return state.user.sendVerificationEmailInProgress;
};
