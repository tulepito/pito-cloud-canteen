export const generalPaths = {
  SignIn: '/dang-nhap',
  SignUp: '/dang-ky',
  RecoveryPassword: '/quen-mat-khau',
  ResetPassword: '/dat-lai-mat-khau',
  StyleGuide: '/style-guide',
  EmailVerification: '/xac-nhan-email',
  Home: '/',
};

export const enGeneralPaths = {
  SignIn: '/sign-in',
  SignUp: '/sign-up',
  RecoveryPassword: '/forgot-password',
  ResetPassword: '/reset-password',
  StyleGuide: '/style-guide',
  EmailVerification: '/verify-email',
  Home: '/',
  DeliveryTracking: '/delivery-tracking/[subOrderId]',
};

export const personalPaths = {
  Account: '/company/personal/account',
  Nutrition: '/company/personal/nutrition',
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

export const IgnoredAuthCheckRoutes = [
  generalPaths.StyleGuide,
  generalPaths.RecoveryPassword,
  generalPaths.EmailVerification,
  enGeneralPaths.EmailVerification,
  enGeneralPaths.RecoveryPassword,
  generalPaths.ResetPassword,
  enGeneralPaths.ResetPassword,
  enGeneralPaths.DeliveryTracking,
];
export const IgnoredPermissionCheckRoutes = [
  generalPaths.SignIn,
  generalPaths.SignUp,
  generalPaths.RecoveryPassword,
  generalPaths.StyleGuide,
  generalPaths.ResetPassword,
  enGeneralPaths.SignIn,
  enGeneralPaths.SignUp,
  enGeneralPaths.RecoveryPassword,
  enGeneralPaths.ResetPassword,
  generalPaths.EmailVerification,
  enGeneralPaths.EmailVerification,
  enGeneralPaths.DeliveryTracking,
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
  UpdateDraftOrder: '/admin/order/create/[orderId]',
  OrderDetail: '/admin/order/[orderId]',
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
    label: 'Thực đơn',
  },
  ManagePartnerFixedMenus: {
    path: '/admin/partner/[restaurantId]/settings/menu/fixed-menu',
    label: 'Thực đơn cố định',
  },
  ManagePartnerCycleMenus: {
    path: '/admin/partner/[restaurantId]/settings/menu/cycle-menu',
    label: 'Thực đơn theo chu kỳ',
  },
  PartnerMenuFixedDetails: {
    path: '/admin/partner/[restaurantId]/settings/menu/fixed-menu/[menuId]',
    label: 'Chi tiết thực đơn',
  },
  PartnerMenuCycleDetails: {
    path: '/admin/partner/[restaurantId]/settings/menu/cycle-menu/[menuId]',
    label: 'Chi tiết thực đơn',
  },
  CreatePartnerMenu: {
    path: '/admin/partner/[restaurantId]/settings/menu/create',
    label: 'Tạo thực đơn',
  },
  EditPartnerMenu: {
    path: '/admin/partner/[restaurantId]/settings/menu/[menuId]',
    label: 'Chỉnh sửa thực đơn',
  },
  EditOrder: {
    path: '/admin/order/[orderId]',
    label: 'Tạo đơn hàng',
  },
  UpdateDraftOrder: {
    path: adminPaths.UpdateDraftOrder,
    label: 'Chỉnh sửa',
  },
  Setting: {
    path: '/admin/setting',
    label: 'Cài đặt',
  },
  AttributesSetting: {
    path: '/admin/setting/attributes',
    label: 'Cài đặt món ăn',
  },
  AdminAccountInformationSetting: {
    path: '/admin/account/info',
    label: 'Thông tin tài khoản',
  },
  AdminAccountSetting: {
    path: '/admin/account/setting',
    label: 'Cài đặt tài khoản',
  },
  AdminAccount: {
    path: '/admin/account',
    label: 'Tài khoản',
  },
  AdminAccountPasswordSetting: {
    path: '/admin/account/password',
    label: 'Mật khẩu',
  },
  AdminPayment: {
    path: '/admin/payment',
    label: 'Thanh toán',
  },
  PartnerPayment: {
    path: '/admin/payment-partner',
    label: 'Thanh toán đối tác',
  },
  ClientPayment: {
    path: '/admin/payment-client',
    label: 'Thanh toán khách hàng',
  },
} as const;

export const companyPaths = {
  Home: '/company/[companyId]/dashboard',
  Detail: '/company/[companyId]',
  Account: '/company/[companyId]/account',
  ManageOrders: '/company/[companyId]/orders',
  ManageOrderDetail: '/company/orders/[orderId]',
  ManageOrderPicking: '/company/orders/[orderId]/picking',
  OrderRating: '/company/orders/[orderId]/rating',
  GroupSetting: '/company/[companyId]/group-setting',
  Logo: '/company/[companyId]/logo',
  Members: '/company/[companyId]/members',
  MembersDetail: '/company/[companyId]/members/[memberEmail]',
  CreateNewOrder: '/company/booker/orders/new',
  EditDraftOrder: '/company/booker/orders/draft/[orderId]',
  OrderSelectRestaurant: '/company/booker/orders/draft/[orderId]/restaurants',
  GroupDetail: '/company/[companyId]/group-setting',
  GroupMemberDetail:
    '/company/[companyId]/group-setting/[groupId]/member/[memberId]',
  Nutrition: '/company/[companyId]/nutrition',
};

export const quizPaths = {
  Welcome: '/company/booker/orders/new/quiz/welcome',
  SelectCompany: '/company/booker/orders/new/quiz/select-company',
  PerpackMemberAmount: '/company/booker/orders/new/quiz/perpack-member-amount',
  SpecialDemand: '/company/booker/orders/new/quiz/special-demand',
  MealStyles: '/company/booker/orders/new/quiz/meal-styles',
  Restaurants: '/company/booker/orders/new/quiz/restaurants',
  MealDates: '/company/booker/orders/new/quiz/meal-date',
  CreatingOrder: '/company/booker/orders/new/quiz/creating-order',
};

export const participantPaths = {
  Order: '/participant/order/[orderId]',
  OrderList: '/participant/orders',
  SubOrderList: '/participant/sub-orders',
  Account: '/participant/account',
  AccountProfile: '/participant/account/profile',
  AccountChangePassword: '/participant/account/change-password',
  AccountSpecialDemand: '/participant/account/special-demand',
  PlanDetail: '/participant/plans/[planId]',
};

export const partnerPaths = {
  Home: '/partner',
  ManageOrders: '/partner/orders',
  SubOrderDetail: '/partner/orders/[subOrderId]',
};

export const partnerRoutes = {
  ManageOrders: {
    path: partnerPaths.ManageOrders,
    label: 'Danh sách đơn hàng',
  },

  Home: {
    path: partnerPaths.Home,
    label: 'Trang chủ',
  },
  SubOrderDetail: {
    path: partnerPaths.SubOrderDetail,
    label: 'Chi tiết đơn hàng',
  },
};
