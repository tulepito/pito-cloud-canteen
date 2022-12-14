/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable no-nested-ternary */
/* eslint-disable import/no-cycle */
import type { ThunkAPI } from '@redux/store';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { util as sdkUtil } from '@sharetribe/sdk';
import { denormalisedResponseEntities } from '@utils/data';
import { storableError } from '@utils/errors';

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

// ================ Thunk types ================ //
const FETCH_CURRENT_USER = 'app/User/FETCH_CURRENT_USER';
const SEND_VERIFICATION_EMAIL = 'app/user/SEND_VERIFICATION_EMAIL';

interface IUserState {
  currentUser: any;
  currentUserShowError: any;
  sendVerificationEmailInProgress: boolean;
  sendVerificationEmailError: any;
}

const initialState: IUserState = {
  currentUser: null,
  currentUserShowError: null,
  sendVerificationEmailInProgress: false,
  sendVerificationEmailError: null,
};

// ================ Selectors ================ //

export const hasCurrentUserErrors = (state: any) => {
  const { user } = state;
  return (
    user.currentUserShowError ||
    user.currentUserHasListingsError ||
    user.currentUserNotificationCountError ||
    user.currentUserHasOrdersError
  );
};

export const verificationSendingInProgress = (state: any) => {
  return state.user.sendVerificationEmailInProgress;
};

// ================ Thunks ================ //
const fetchCurrentUser = createAsyncThunk(
  FETCH_CURRENT_USER,
  async (
    params: any,
    { dispatch, extra: sdk, rejectWithValue, fulfillWithValue }: ThunkAPI,
  ) => {
    try {
      const parameters = params || {
        include: ['profileImage'],
        'fields.image': [
          'variants.square-small',
          'variants.square-small2x',
          'variants.square-xsmall',
          'variants.square-xsmall2x',
        ],
        'imageVariant.square-xsmall': sdkUtil.objectQueryString({
          w: 40,
          h: 40,
          fit: 'crop',
        }),
        'imageVariant.square-xsmall2x': sdkUtil.objectQueryString({
          w: 80,
          h: 80,
          fit: 'crop',
        }),
      };

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
    } catch (error: any) {
      // Make sure auth info is up to date
      dispatch(authThunks.authInfo());
      return rejectWithValue(storableError(error));
    }
  },
);

const sendVerificationEmail = createAsyncThunk(
  SEND_VERIFICATION_EMAIL,
  async (_, { getState, dispatch, extra: sdk, rejectWithValue }: ThunkAPI) => {
    if (verificationSendingInProgress(getState())) {
      return rejectWithValue(
        new Error('Verification email sending already in progress'),
      );
    }
    try {
      await sdk.currentUser.sendVerificationEmail();
    } catch (error) {
      return rejectWithValue(storableError(error));
    }
  },
);

export const userThunks = {
  fetchCurrentUser,
  sendVerificationEmail,
};

const userSlice = createSlice({
  name: 'User',
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
        return { ...state, currentUserShowError: null };
      })
      .addCase(fetchCurrentUser.fulfilled, (state, { payload }) => {
        return {
          ...state,
          currentUser: mergeCurrentUser(state.currentUser, payload),
        };
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        return { ...state, currentUserShowError: action?.error?.message };
      })

      .addCase(sendVerificationEmail.pending, (state) => {
        return {
          ...state,
          sendVerificationEmailInProgress: true,
        };
      })
      .addCase(sendVerificationEmail.fulfilled, (state) => {
        return {
          ...state,
          sendVerificationEmailInProgress: false,
        };
      })
      .addCase(sendVerificationEmail.rejected, (state, action) => {
        return {
          ...state,
          sendVerificationEmailInProgress: false,
          sendVerificationEmailError: action?.error?.message,
        };
      });
  },
});

export const userActions = userSlice.actions;
export default userSlice.reducer;
