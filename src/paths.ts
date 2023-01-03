export const generalPaths = {
  SignIn: '/dang-nhap',
  SignUp: '/dang-ky',
  RecoveryPassword: '/quen-mat-khau',
  ResetPassword: '/dat-lai-mat-khau',
  StyleGuide: '/style-guide',
  Home: '/',
};

export const IgnoredAuthCheckRoutes = [generalPaths.StyleGuide];
export const IgnoredPermissionCheckRoutes = [generalPaths.StyleGuide];

export const NonRequireAuthenticationRoutes = [
  generalPaths.RecoveryPassword,
  generalPaths.ResetPassword,
  generalPaths.SignIn,
  generalPaths.SignUp,
];

export const adminPaths = {
  Home: '/admin',
};

export const companyPaths = {
  Home: '/company',
};
