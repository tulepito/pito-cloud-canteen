export const generalPaths = {
  SignIn: '/dang-nhap',
  SignUp: '/dang-ky',
  RecoveryPassword: '/quen-mat-khau',
  ResetPassword: '/dat-lai-mat-khau',
  StyleGuide: '/style-guide',
  Home: '/',
  OrderManageMent: '/orders/[orderId]',
};

const enGeneralPaths = {
  SignIn: '/sign-in',
  SignUp: '/sign-up',
  RecoveryPassword: '/forgot-password',
  ResetPassword: '/reset-password',
  StyleGuide: '/style-guide',
  Home: '/',
};

export const NonRequireAuthenticationRoutes = [
  generalPaths.RecoveryPassword,
  generalPaths.ResetPassword,
  generalPaths.SignIn,
  generalPaths.SignUp,
  enGeneralPaths.RecoveryPassword,
  enGeneralPaths.ResetPassword,
  enGeneralPaths.SignIn,
  enGeneralPaths.SignUp,
];

export const IgnoredAuthCheckRoutes = [generalPaths.StyleGuide];
export const IgnoredPermissionCheckRoutes = [
  generalPaths.SignIn,
  generalPaths.SignUp,
  generalPaths.StyleGuide,
  enGeneralPaths.SignIn,
  enGeneralPaths.SignUp,
  generalPaths.OrderManageMent,
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

// Should be an object => path should has its label
export const adminRoutes = {
  Dashboard: {
    path: '/admin',
    label: 'Trang chủ',
  },
  ManageUsers: {
    path: '/admin/users',
    label: 'Quản lý người dùng',
  },
  ManageCompanies: {
    path: '/admin/company',
    label: 'Quản lý khách hàng',
  },
  EditCompany: {
    path: '/admin/company/[companyId]/edit',
    label: 'Chỉnh sửa',
  },
  CompanyDetails: {
    path: '/admin/company/[companyId]',
    label: 'Thông tin khách hàng',
  },
  CreateCompany: {
    path: '/admin/company/create',
    label: 'Tạo khách hàng',
  },
  ManagePartners: {
    path: '/admin/partner',
    label: 'Quản lý đối tác',
  },
  CreatePartner: {
    path: '/admin/partner/create',
    label: 'Tạo đối tác',
  },
  EditPartner: {
    path: '/admin/partner/[restaurantId]/edit',
    label: 'Chỉnh sửa',
  },
  PartnerDetails: {
    path: '/admin/partner/[restaurantId]',
    label: 'Thông tin đối tác',
  },
  ManageOrders: {
    path: '/admin/order',
    label: 'Quản lý đơn hàng',
  },
  CreateOrder: {
    path: '/admin/order/create',
    label: 'Tạo đơn hàng',
  },
  OrderDetails: {
    path: '/admin/order/[orderId]',
    label: 'Chi tiết đơn hàng',
  },
  PartnerSettings: {
    path: '/admin/partner/[restaurantId]/settings',
    label: 'Cài đặt nhà hàng',
  },
  ManagePartnerFoods: {
    path: '/admin/partner/[restaurantId]/settings/food',
    label: 'Danh sách món ăn',
  },
  CreatePartnerFood: {
    path: '/admin/partner/[restaurantId]/settings/food/create',
    label: 'Tạo món ăn',
  },
  EditPartnerFood: {
    path: '/admin/partner/[restaurantId]/settings/food/[foodId]',
    label: 'Chỉnh sửa món ăn',
  },
  ManagePartnerMenus: {
    path: '/admin/partner/[restaurantId]/settings/menu',
    label: 'Danh sách thực đơn',
  },
  PartnerMenuDetails: {
    path: '/admin/partner/[restaurantId]/settings/menu/[menuId]',
    label: 'Danh sách thực đơn',
  },
  CreatePartnerMenu: {
    path: '/admin/partner/[restaurantId]/settings/menu/create',
    label: 'Tạo thực đơn',
  },
  EditPartnerMenu: {
    path: '/admin/partner/[restaurantId]/settings/menu/create',
    label: 'Chỉnh sửa thực đơn',
  },
  EditOrder: {
    path: '/admin/order/[orderId]',
    label: 'Tạo đơn hàng',
  },
} as const;

export const companyPaths = {
  Home: '/company',
  Detail: '/company/[companyId]',
  ContactPoint: '/company/[companyId]/contact-point',
  GroupSetting: '/company/[companyId]/group-setting',
  Logo: '/company/[companyId]/logo',
  CreateNewOrder: '/company/booker/orders/new',
  EditDraftOrder: '/company/booker/orders/draft/[orderId]',
  OrderSelectRestaurant: '/company/booker/orders/draft/[orderId]/restaurants',
};
