/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable no-nested-ternary */
import { createAsyncThunk, createDeepEqualSelector } from '@redux/redux.helper';
import type { RootState } from '@redux/store';
import { createSlice } from '@reduxjs/toolkit';
import { denormalisedResponseEntities, ensureCurrentUser } from '@utils/data';
import { storableError } from '@utils/errors';

// eslint-disable-next-line import/no-cycle
import { authThunks } from './auth.slice';

const mergeCurrentUser = (oldCurrentUser: any, newCurrentUser: any) => {
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
  return newCurrentUser === null
    ? null
    : oldCurrentUser === null
    ? newCurrentUser
    : { id, type, attributes, ...oldRelationships, ...relationships };
};

type TUserState = {
  currentUser: any;
  currentUserShowError: any;
  sendVerificationEmailInProgress: boolean;
  sendVerificationEmailError: any;
};

const initialState: TUserState = {
  currentUser: null,
  currentUserShowError: null,
  sendVerificationEmailInProgress: false,
  sendVerificationEmailError: null,
};

// ================ Thunks ================ //
const FETCH_CURRENT_USER = 'app/User/FETCH_CURRENT_USER';
const SEND_VERIFICATION_EMAIL = 'app/user/SEND_VERIFICATION_EMAIL';

const fetchCurrentUser = createAsyncThunk(
  FETCH_CURRENT_USER,
  async (
    params: any | undefined,
    { dispatch, extra: sdk, rejectWithValue, fulfillWithValue },
  ) => {
    try {
      const parameters = params || {};
      const response = await sdk.currentUser.show(parameters);
      const entities = denormalisedResponseEntities(response);

      if (entities.length !== 1) {
        return rejectWithValue(
          new Error('Expected a resource in the sdk.currentUser.show response'),
        );
      }
      const currentUser = entities[0];
      // Make sure auth info is up to date
      dispatch(authThunks.authInfo());

      return fulfillWithValue(currentUser);
    } catch (error) {
      // Make sure auth info is up to date
      dispatch(authThunks.authInfo());
      return rejectWithValue(storableError(error));
    }
  },
);

const sendVerificationEmail = createAsyncThunk(
  SEND_VERIFICATION_EMAIL,
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
        currentUserHasListings: false,
        currentUserHasListingsError: null,
        currentUserNotificationCount: 0,
        currentUserNotificationCountError: null,
        currentUserListing: null,
        currentUserListingFetched: false,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.currentUserShowError = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.currentUser = mergeCurrentUser(state.currentUser, action.payload);
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
