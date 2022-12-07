import { createAction, createReducer } from "@reduxjs/toolkit";

const authenticated = (authInfo: any) =>
  authInfo && authInfo.isAnonymous === false;

// ================ Action types ================ //

const AUTH_INFO_REQUEST = "app/Auth/AUTH_INFO_REQUEST";
const AUTH_INFO_SUCCESS = "app/Auth/AUTH_INFO_SUCCESS";

interface AuthState {
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

const initialState = {
  isAuthenticated: false,

  // scopes associated with current token
  authScopes: [],

  // auth info
  authInfoLoaded: false,

  // login
  loginError: null,
  loginInProgress: false,

  // logout
  logoutError: null,
  logoutInProgress: false,

  // signup
  signupError: null,
  signupInProgress: false,

  // confirm (create use with idp)
  confirmError: null,
  confirmInProgress: false,
} as AuthState;

const authInfoRequest = createAction(AUTH_INFO_REQUEST);
const authInfoSuccess = createAction<any>(AUTH_INFO_SUCCESS);

const authReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(authInfoRequest, (state, action) => state)
    .addCase(authInfoSuccess, (state, { payload }) => {
      return {
        ...state,
        authInfoLoaded: true,
        isAuthenticated: authenticated(payload),
        authScopes: payload.scopes,
      };
    });
});

export default authReducer;
