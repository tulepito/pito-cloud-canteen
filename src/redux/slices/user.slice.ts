/* eslint-disable unused-imports/no-unused-vars */
import { createSlice } from '@reduxjs/toolkit';
import chunk from 'lodash/chunk';
import flatten from 'lodash/flatten';

import { createAsyncThunk, createDeepEqualSelector } from '@redux/redux.helper';
import type { RootState } from '@redux/store';
import {
  CurrentUser,
  denormalisedResponseEntities,
  ensureCurrentUser,
} from '@utils/data';
import { EImageVariants, EUserPermission } from '@utils/enums';
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
      return permission === 'booker';
    });
  }

  if (isAdmin) return EUserPermission.admin;
  if (isPartner) return EUserPermission.partner;
  if (isCompany || isBooker) return EUserPermission.company;

  return EUserPermission.normal;
};

type TUserState = {
  currentUser: TCurrentUser | null;
  currentUserShowError: any;
  userPermission: EUserPermission;
  sendVerificationEmailInProgress: boolean;
  sendVerificationEmailError: any;
  favoriteRestaurants: any[];
  favoriteFood: any[];

  updateProfileInProgress: boolean;
  updateProfileError: any;
};

const initialState: TUserState = {
  currentUser: null,
  currentUserShowError: null,
  userPermission: EUserPermission.normal,
  sendVerificationEmailInProgress: false,
  sendVerificationEmailError: null,
  favoriteRestaurants: [],
  favoriteFood: [],

  updateProfileInProgress: false,
  updateProfileError: null,
};

// ================ Thunks ================ //
const fetchCurrentUser = createAsyncThunk(
  'app/user/FETCH_CURRENT_USER',
  async (params: TObject | undefined, { extra: sdk, rejectWithValue }) => {
    const parameters = params || {
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

    return { currentUser, favoriteRestaurants, favoriteFood };
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
  async (payload: TObject, { extra: sdk, dispatch }) => {
    await sdk.currentUser.updateProfile(payload);

    await dispatch(fetchCurrentUser());
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
        userPermission: EUserPermission.normal,
        sendVerificationEmailInProgress: false,
        sendVerificationEmailError: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.currentUserShowError = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        const { currentUser, favoriteRestaurants, favoriteFood } =
          action.payload;

        state.currentUser = mergeCurrentUser(state.currentUser, currentUser);
        state.userPermission = detectUserPermission(currentUser);
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
      .addCase(updateProfile.fulfilled, (state) => {
        state.updateProfileInProgress = false;
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
