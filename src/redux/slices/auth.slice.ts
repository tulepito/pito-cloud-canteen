import { createSlice } from '@reduxjs/toolkit';
import isEmpty from 'lodash/isEmpty';

import { postSignUpApi } from '@apis/userApi';
import { createAsyncThunk } from '@redux/redux.helper';
import type { RootState } from '@redux/store';
import { storableError } from '@utils/errors';
import type { TObject } from '@utils/types';

const authenticated = (authInfo: TObject) => {
  return authInfo && authInfo.isAnonymous === false;
};

enum EAuthState {
  idle = 'idle',
  isSigningIn = 'isSigningIn',
  isLoggingOut = 'isLoggingOut',
  isSigningUp = 'isSigningUp',
}

type TAuthState = {
  isAuthenticated: boolean;
  // scopes associated with current token
  authScopes: [];
  // auth info
  authInfoLoaded: boolean;
  // auth Status
  authStatus: EAuthState;
  // login
  signInError: any;
  // logout
  logoutError: any;
  // signup
  signUpError: any;
};

const initialState: TAuthState = {
  isAuthenticated: false,
  authScopes: [],
  authInfoLoaded: false,
  authStatus: EAuthState.idle,
  signInError: null,
  logoutError: null,
  signUpError: null,
};

// ================ Thunk types ================ //
const AUTH_INFO = 'app/auth/AUTH_INFO';
const SIGN_UP = 'app/auth/SIGN_UP';
const LOGIN = 'app/auth/LOGIN';
const LOGOUT = 'app/auth/LOGOUT';

const authInfo = createAsyncThunk(AUTH_INFO, async (_, { extra: sdk }) => {
  try {
    const info = await sdk.authInfo();

    return info;
  } catch (error) {
    return null;
  }
});

const login = createAsyncThunk(
  LOGIN,
  async (params: { email: string; password: string }, { extra: sdk }) => {
    const { email: username, password } = params;
    await sdk.login({ username, password });
  },
  {
    serializeError: storableError,
  },
);

const logout = createAsyncThunk(
  LOGOUT,
  async (_, { extra: sdk }) => {
    await sdk.logout();
  },
  {
    serializeError: storableError,
  },
);

const signUp = createAsyncThunk(
  SIGN_UP,
  async (params: TObject, { dispatch, extra: sdk }) => {
    const { email, password, firstName, lastName, ...rest } = params;
    const defaultParams = {
      email,
      password,
      firstName,
      lastName,
    };
    const createUserParams = isEmpty(rest)
      ? defaultParams
      : {
          ...defaultParams,
          protectedData: {
            ...rest,
          },
        };

    // We must login the user if signup succeeds since the API doesn't
    // do that automatically.
    await sdk.currentUser.create(createUserParams);
    await dispatch(login({ email, password }));

    postSignUpApi();
  },
  {
    serializeError: storableError,
  },
);

export const authThunks = {
  authInfo,
  signUp,
  login,
  logout,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(authInfo.pending, (state) => state)
      .addCase(authInfo.fulfilled, (state, { payload }) => {
        return {
          ...state,
          authInfoLoaded: true,
          isAuthenticated: authenticated(payload),
          authScopes: payload.scopes || [],
        };
      })

      .addCase(signUp.pending, (state) => {
        return {
          ...state,
          authStatus: EAuthState.isSigningUp,
          signInError: null,
          signUpError: null,
        };
      })
      .addCase(signUp.fulfilled, (state) => {
        return { ...state, authStatus: EAuthState.idle };
      })
      .addCase(signUp.rejected, (state, action) => {
        return {
          ...state,
          authStatus: EAuthState.idle,
          signUpError: action.error,
        };
      })

      .addCase(login.pending, (state) => {
        return {
          ...state,
          authStatus: EAuthState.isSigningIn,
          signInError: null,
          logoutError: null,
          signUpError: null,
        };
      })
      .addCase(login.fulfilled, (state) => {
        return { ...state, authStatus: EAuthState.idle };
      })
      .addCase(login.rejected, (state, action) => {
        return {
          ...state,
          authStatus: EAuthState.idle,
          signInError: action.error,
        };
      })

      .addCase(logout.pending, (state) => {
        return {
          ...state,
          authStatus: EAuthState.isLoggingOut,
          signInError: null,
          logoutError: null,
        };
      })
      .addCase(logout.fulfilled, (state) => {
        return {
          ...state,
          authStatus: EAuthState.idle,
          isAuthenticated: false,
          authScopes: [],
        };
      })
      .addCase(logout.rejected, (state, action) => {
        return {
          ...state,
          authStatus: EAuthState.idle,
          logoutError: action.error,
        };
      });
  },
});

export default authSlice.reducer;

// ================ Selectors ================ //
export const authenticationInProgress = (state: RootState) => {
  return state.auth.authStatus !== EAuthState.idle;
};
