export const generalPaths = {
  SignIn: '/dang-nhap',
  SignUp: '/dang-ky',
  RecoveryPassword: '/quen-mat-khau',
  ResetPassword: '/dat-lai-mat-khau',
  StyleGuide: '/style-guide',
  Home: '/',
};

export const NonRequireAuthenticationRoutes = [
  generalPaths.RecoveryPassword,
  generalPaths.ResetPassword,
  generalPaths.SignIn,
  generalPaths.SignUp,
  generalPaths.StyleGuide,
];

export const adminPaths = {
  Dashboard: '/admin',
  ManageUsers: '/admin/users',
  ManageCompanies: '/admin/company',
  EditCompany: '/admin/company/[companyId]/edit',
  CreateCompany: '/admin/company/create',
  ManagePartners: '/admin/partner',
  CreatePartner: '/admin/partner/create',
  EditPartner: '/admin/partner/[partnerId]/edit',
  ManageOrders: '/admin/order',
  CreateOrder: '/admin/order/create',
};

export const companyPaths = {
  Home: '/company',
  Detail: '/company/[companyId]',
  GroupSetting: '/company/[companyId]/group-setting',
};
