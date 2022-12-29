const paths = {
  SignIn: '/dang-nhap',
  SignUp: '/dang-ky',
  RecoveryPassword: '/quen-mat-khau',
  ResetPassword: '/dat-lai-mat-khau',
  HomePage: '/',
};

export const adminPaths = {
  Dashboard: '/',
  ManageUsers: '/admin/user',
  ManageCompanies: '/admin/company',
  EditCompany: '/admin/company/[companyId]/edit',
  CreateCompany: '/admin/company/create',
  ManagePartners: '/admin/partner',
  CreatePartner: '/admin/partner/create',
  EditPartner: '/admin/partner/[partnerId]/edit',
  ManageOrders: '/admin/order',
  CreateOrder: '/admin/order/create',
};

export const AuthenticationRoutes = [
  paths.RecoveryPassword,
  paths.SignIn,
  paths.SignUp,
];

export default paths;
