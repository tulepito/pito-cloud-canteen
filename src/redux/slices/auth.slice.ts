import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const authenticated = (authInfo: any) =>
  authInfo && authInfo.isAnonymous === false;

// ================ Thunk types ================ //
const AUTH_INFO = 'app/Auth/AUTH_INFO';

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

const initialState: AuthState = {
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
type ThunkAPI = {
  dispatch?: any;
  getState?: any;
  extra: any;
};

const authInfo = createAsyncThunk(
  AUTH_INFO,
  async (_, { extra: sdk }: ThunkAPI) => {
    await sdk.currentUser.create(
      {
        email: 'joe.dunphy@example.com',
        password: 'secret-pass',
        firstName: 'Joe',
        lastName: 'Dunphy',
        displayName: 'Dunphy Co.',
        bio: 'Hello, I am Joe.',
        publicData: {
          age: 27,
        },
        protectedData: {
          phoneNumber: '+1-202-555-5555',
        },
        privateData: {
          discoveredServiceVia: 'Twitter',
        },
      },
      {
        expand: true,
      },
    );

    return '';
  },
);

export const authThunks = {
  authInfo,
};

const authSlice = createSlice({
  name: 'auth',
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
      });
  },
});

export default authSlice.reducer;
