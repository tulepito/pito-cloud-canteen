/* eslint-disable import/no-cycle */

import type { ThunkAPI } from '@redux/store';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { storableError } from '@utils/errors';
import isEmpty from 'lodash/isEmpty';

import { userActions, userThunks } from './user.slice';

const authenticated = (authInfo: any) =>
  authInfo && authInfo.isAnonymous === false;

// ================ Thunk types ================ //
const AUTH_INFO = 'app/Auth/AUTH_INFO';
const SIGN_UP = 'app/Auth/SIGN_UP';
const LOGIN = 'app/Auth/LOGIN';
const LOGOUT = 'app/Auth/LOGOUT';

interface IAuthState {
  isAuthenticated: boolean;
  // scopes associated with current token
  authScopes: [];
  // auth info
  authInfoLoaded: boolean;
  // login
  loginError: any;
  loginInProgress: boolean;
  // logout
  logoutError: any;
  logoutInProgress: boolean;
  // signup
  signupError: any;
  signupInProgress: boolean;
  // confirm (create use with idp)
  confirmError: any;
  confirmInProgress: boolean;
}

const initialState: IAuthState = {
  isAuthenticated: false,
  authScopes: [],
  authInfoLoaded: false,
  loginError: null,
  loginInProgress: false,
  logoutError: null,
  logoutInProgress: false,
  signupError: null,
  signupInProgress: false,
  confirmError: null,
  confirmInProgress: false,
};

// ================ Selectors ================ //
export const authenticationInProgress = (state: any) => {
  const { loginInProgress, logoutInProgress, signupInProgress } = state.auth;
  return loginInProgress || logoutInProgress || signupInProgress;
};

//

const authInfo = createAsyncThunk(
  AUTH_INFO,
  async (_, { extra: sdk, fulfillWithValue }: ThunkAPI) => {
    try {
      const info = await sdk.authInfo();
      return fulfillWithValue(info);
    } catch (error) {
      return fulfillWithValue(null);
    }
  },
);

const login = createAsyncThunk(
  LOGIN,
  async (
    params: { email: string; password: string },
    { getState, dispatch, extra: sdk, rejectWithValue }: ThunkAPI,
  ) => {
    if (authenticationInProgress(getState())) {
      return rejectWithValue(new Error('Login or logout already in progress'));
    }

    try {
      const { email: username, password } = params;
      await sdk.login({ username, password });

      dispatch(userThunks.fetchCurrentUser(undefined));
    } catch (error: any) {
      return rejectWithValue(storableError(error));
    }
  },
);

const logout = createAsyncThunk(
  LOGOUT,
  async (_, { getState, dispatch, extra: sdk, rejectWithValue }: ThunkAPI) => {
    if (authenticationInProgress(getState())) {
      return rejectWithValue(new Error('Login or logout already in progress'));
    }

    try {
      await sdk.logout();
      dispatch(userActions.clearCurrentUser());
    } catch (error: any) {
      return rejectWithValue(storableError(error));
    }
  },
);

const signUp = createAsyncThunk(
  SIGN_UP,
  async (
    params: Record<string, any>,
    { getState, dispatch, extra: sdk, rejectWithValue }: ThunkAPI,
  ) => {
    if (authenticationInProgress(getState())) {
      return rejectWithValue(new Error('Login or logout already in progress'));
    }

    try {
      const { email, password, firstName, lastName, ...rest } = params;
      const createUserParams = isEmpty(rest)
        ? { email, password, firstName, lastName }
        : { email, password, firstName, lastName, protectedData: { ...rest } };

      // We must login the user if signup succeeds since the API doesn't
      // do that automatically.
      await sdk.currentUser.create(createUserParams);
      dispatch(login({ email, password }));
    } catch (error) {
      return rejectWithValue(storableError(error));
    }
  },
);

export const authThunks = {
  authInfo,
  signUp,
  login,
  logout,
};

const authSlice = createSlice({
  name: 'Auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(authInfo.pending, (state) => state)
      .addCase(authInfo.fulfilled, (state, { payload }: any) => {
        return {
          ...state,
          authInfoLoaded: true,
          isAuthenticated: authenticated(payload),
          authScopes: payload.scopes,
        };
      })

      .addCase(signUp.pending, (state) => {
        return {
          ...state,
          signupInProgress: true,
          loginError: null,
          signupError: null,
        };
      })
      .addCase(signUp.fulfilled, (state) => {
        return { ...state, signupInProgress: false };
      })
      .addCase(signUp.rejected, (state, { payload }: any) => {
        return { ...state, signupInProgress: false, signupError: payload };
      })

      .addCase(login.pending, (state) => {
        return {
          ...state,
          loginInProgress: true,
          loginError: null,
          logoutError: null,
          signupError: null,
        };
      })
      .addCase(login.fulfilled, (state) => {
        return { ...state, loginInProgress: false, isAuthenticated: true };
      })
      .addCase(login.rejected, (state, { payload }: any) => {
        return { ...state, loginInProgress: false, loginError: payload };
      })

      .addCase(logout.pending, (state) => {
        return {
          ...state,
          logoutInProgress: true,
          loginError: null,
          logoutError: null,
        };
      })
      .addCase(logout.fulfilled, (state) => {
        return {
          ...state,
          logoutInProgress: false,
          isAuthenticated: false,
          authScopes: [],
        };
      })
      .addCase(logout.rejected, (state, { payload }: any) => {
        return { ...state, logoutInProgress: false, logoutError: payload };
      });
  },
});

export default authSlice.reducer;
