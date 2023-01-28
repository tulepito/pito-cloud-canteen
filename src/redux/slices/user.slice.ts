/* eslint-disable unused-imports/no-unused-vars */
import { createAsyncThunk, createDeepEqualSelector } from '@redux/redux.helper';
import type { RootState } from '@redux/store';
import { createSlice } from '@reduxjs/toolkit';
import { denormalisedResponseEntities, ensureCurrentUser } from '@utils/data';
import { EUserPermission } from '@utils/enums';
import { storableError } from '@utils/errors';
import type { TCurrentUser, TObject } from '@utils/types';
import get from 'lodash/get';

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
  const { isCompany, isAdmin, company } = get(
    currentUser,
    'attributes.profile.metadata',
  );

  let isBooker;

  if (!company) {
    isBooker = false;
  } else {
    isBooker = Object.values(company).some(({ permission }: any) => {
      return permission === 'booker';
    });
  }

  if (isAdmin) return EUserPermission.admin;
  if (isCompany || isBooker) return EUserPermission.company;

  return EUserPermission.normal;
};

type TUserState = {
  currentUser: TCurrentUser | null;
  currentUserShowError: any;
  userPermission: EUserPermission;
  sendVerificationEmailInProgress: boolean;
  sendVerificationEmailError: any;
};

const initialState: TUserState = {
  currentUser: null,
  currentUserShowError: null,
  userPermission: EUserPermission.normal,
  sendVerificationEmailInProgress: false,
  sendVerificationEmailError: null,
};

// ================ Thunks ================ //
const fetchCurrentUser = createAsyncThunk(
  'app/user/FETCH_CURRENT_USER',
  async (params: TObject | undefined, { extra: sdk }) => {
    const queryParams = params || {};
    const [currentUser] = denormalisedResponseEntities(
      await sdk.currentUser.show(queryParams),
    );
    return currentUser;
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

export const userThunks = {
  fetchCurrentUser,
  sendVerificationEmail,
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
        const currentUser = action.payload;

        state.currentUser = mergeCurrentUser(state.currentUser, currentUser);
        state.userPermission = detectUserPermission(currentUser);
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
