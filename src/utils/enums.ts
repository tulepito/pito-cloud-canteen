import { EBadgeType } from '@components/Badge/Badge';

export enum EImageVariants {
  default = 'default',
  landscapeCrop = 'landscape-crop',
  landscapeCrop2x = 'landscape-crop2x',
  landscapeCrop4x = 'landscape-crop4x',
  landscapeCrop6x = 'landscape-crop6x',
  scaledSmall = 'scaled-small',
  scaledMedium = 'scaled-medium',
  scaledLarge = 'scaled-large',
  scaledXLarge = 'scaled-xlarge',
  squareSmall = 'square-small',
  squareSmall2x = 'square-small2x',
  squareXsSmall = 'square-xsmall',
  squareXsSmall2x = 'square-xsmall2x',
  facebook = 'facebook',
  twitter = 'twitter',
}

export enum EListingMenuStates {
  draft = 'draft',
  pendingRestaurantApproval = 'pendingRestaurantApproval',
  published = 'published',
  closed = 'closed',
}

export enum EListingStates {
  draft = 'draft',
  pendingApproval = 'pendingApproval',
  published = 'published',
  closed = 'closed',
}

export enum EAvailabilityPlans {
  day = 'availability-plan/day',
  time = 'availability-plan/time',
}

export enum EDayOfWeek {
  mon = 'mon',
  tue = 'tue',
  wed = 'wed',
  thu = 'thu',
  fri = 'fri',
  sat = 'sat',
  sun = 'sun',
}

export enum EBookingStates {
  pending = 'pending',
  accepted = 'accepted',
  cancelled = 'cancelled',
  declined = 'declined',
}

export enum ETimeSlots {
  day = 'time-slot/day',
  time = 'time-slot/time',
}

export enum ETxTransitionActors {
  customer = 'customer',
  provider = 'provider',
  system = 'system',
  operator = 'operator',
}

export enum EReviewRatings {
  one = 1,
  two = 2,
  three = 3,
  four = 4,
  five = 5,
}

export enum EReviewTypes {
  ofProvider = 'ofProvider',
  ofCustomer = 'ofCustomer',
}

export enum ETransactionRoles {
  provider = 'provider',
  customer = 'customer',
  operator = 'operator',
}

export enum EErrorCode {
  transactionListingNotFound = 'transaction-listing-not-found',
  transactionInvalidTransition = 'transaction-invalid-transition',
  transactionAlreadyReviewedByCustomer = 'transaction-already-reviewed-by-customer',
  transactionAlreadyReviewedByProvider = 'transaction-already-reviewed-by-provider',
  transactionBookingTimeNotAvailable = 'transaction-booking-time-not-available',
  paymentFailed = 'transaction-payment-failed',
  chargeZeroPayin = 'transaction-charge-zero-payin',
  chargeZeroPayout = 'transaction-charge-zero-payout',
  emailTaken = 'email-taken',
  emailNotFound = 'email-not-found',
  tooManyVerificationRequests = 'email-too-many-verification-requests',
  uploadOverLimit = 'request-upload-over-limit',
  validationInvalidParams = 'validation-invalid-params',
  validationInValidValue = 'validation-invalid-value',
  notFound = 'not-found',
  forbidden = 'forbidden',
  missingStripeAccount = 'transaction-missing-stripe-account',
  newOwnerAlreadyACompanyUser = 'new-owner-already-a-company-user',
}

export enum ECompanyStatus {
  active = 1,
  unactive = 0,
}

export enum ECompanyStates {
  draft = 'draft',
  published = 'published',
  unactive = 'unactive',
}

export enum EListingType {
  restaurant = 'restaurant',
  food = 'food',
  menu = 'menu',
  subOrder = 'sub-order',
  order = 'order',
  rating = 'rating',
  quotation = 'quotation',
}

export enum EOrderType {
  normal = 'normal',
  group = 'group',
}

export enum EUserPermission {
  company = 'company',
  admin = 'admin',
  partner = 'partner',
  normal = 'normal',
}

export enum ECompanyMemberPermission {
  owner = 'owner',
}

export const startRouteBaseOnPermission = {
  [EUserPermission.company]: '/company',
  [EUserPermission.admin]: '/admin',
  [EUserPermission.normal]: '/participant',
  [EUserPermission.partner]: '/partner',
};

export enum ERestaurantListingStatus {
  new = 'new',
  authorized = 'authorized',
  unsatisfactory = 'unsatisfactory',
}

export enum EInvalidRestaurantCase {
  closed = 'closed',
  noMenusValid = 'noMenusValid',
  stopReceiveOrder = 'stopReceiveOrder',
}

export enum EParticipantOrderStatus {
  empty = 'empty',
  joined = 'joined',
  notJoined = 'notJoined',
  notAllowed = 'notAllowed',
  expired = 'expired',
}

export const RESTAURANT_STATUS_OPTIONS = [
  {
    key: ERestaurantListingStatus.new,
    label: 'Mới',
  },
  {
    key: ERestaurantListingStatus.authorized,
    label: 'Đã xác thực',
  },
  {
    key: ERestaurantListingStatus.unsatisfactory,
    label: 'Không đạt yêu cầu',
  },
];

export const OTHER_OPTION = 'other';

export const LIST_BANKS = [
  {
    key: 'ncb',
    label: 'Ngân hàng NCB',
  },
  {
    key: 'techcombank',
    label: 'Ngân hàng Techcombank',
  },
  {
    key: 'agribank',
    label: 'Ngân hàng Agribank',
  },
  {
    key: 'scb',
    label: 'Ngân hàng SCB',
  },
  {
    key: 'sacombank',
    label: 'Ngân hàng Sacombank',
  },
  {
    key: 'eximbank',
    label: 'Ngân hàng Eximbank',
  },
  {
    key: 'msbank',
    label: 'Ngân hàng MSBank',
  },
  {
    key: 'nam-a-bank',
    label: 'Ngân hàng NamABank',
  },
  {
    key: 'vnmart',
    label: 'Ngân hàng VNMart',
  },
  {
    key: 'vietinbank',
    label: 'Ngân hàng VietinBank',
  },
  {
    key: 'vietcombank',
    label: 'Ngân hàng VietcomBank',
  },
  {
    key: 'hdbank',
    label: 'Ngân hàng HDBank',
  },
  {
    key: 'dong-a-bank',
    label: 'Ngân hàng Đông Á',
  },
  {
    key: 'tpbank',
    label: 'Ngân hàng TPBank',
  },
  {
    key: 'oceanbank',
    label: 'Ngân hàng OceanBank',
  },
  {
    key: 'bidv',
    label: 'Ngân hàng BIDV',
  },
  {
    key: 'vpbank',
    label: 'Ngân hàng VPBank',
  },
  {
    key: 'mbbank',
    label: 'Ngân hàng MBBank',
  },
  {
    key: 'acb',
    label: 'Ngân hàng ACB',
  },
  {
    key: 'ocb',
    label: 'Ngân hàng OCB',
  },
  {
    key: 'ivb',
    label: 'Ngân hàng IVB',
  },
  {
    key: 'nasb',
    label: 'Ngân hàng TMCP Bắc Á (NASP)',
  },
  {
    key: 'anz',
    label: 'Ngân hàng ANZ (ANZ Bank)',
  },
  {
    key: 'phuong-nam-bank',
    label: 'Ngân hàng Phương Nam (Phuong Nam Bank)',
  },
  {
    key: 'vib',
    label: 'Ngân hàng TMCP Quốc Tế Việt Nam (VIB)',
  },
  {
    key: 'viet-a-bank',
    label: 'Ngân hàng Việt Á (VietABank)',
  },
  {
    key: 'petrolimex',
    label: 'Ngân hàng xăng đầu Petrolimex (PG Bank)',
  },
  {
    key: 'lien-viet-post-bank',
    label: 'Ngân hàng bưu điện Liên Việt (LienVietPostBank)',
  },
  {
    key: 'hsbc',
    label: 'Ngân hàng HSBC Việt Nam (HSBC)',
  },
  {
    key: 'mhbbank',
    label: 'Ngân hàng phát triển nhà đồng bằng sông cửu long (MHB Bank)',
  },
  {
    key: 'seabank',
    label: 'Ngân hàng Đông Nam Á (SeABank)',
  },
  {
    key: 'abbank',
    label: 'Ngân hàng TMCP An Bình (ABBank)',
  },
  {
    key: 'citibank',
    label: 'Ngân hàng Citibank Việt Nam (Citibank)',
  },
  {
    key: 'gbbank',
    label: 'Ngân hàng dầu khí toàn cầu (GBBank)',
  },
  {
    key: 'shb',
    label: 'Ngân hàng TMCP Sài Gòn - Hà Nội (SHB)',
  },
  {
    key: 'saigon-bank',
    label: 'Ngân hàng TMCP Sài Gòn công thương (SaiGonBank)',
  },
  {
    key: 'vncp',
    label: 'Ngân hàng xây dựng Việt Nam (VNCP)',
  },
  {
    key: 'kien-long-bank',
    label: 'Ngân hàng TMCP Kiên Long (Kienlongbank)',
  },
  {
    key: 'shinhanbank',
    label: 'Ngân hàng Shinhan (ShinhanBank)',
  },
  {
    key: 'bao-viet-bank',
    label: 'Ngân hàng Bảo Việt (BaovietBank)',
  },
  {
    key: 'vietbank',
    label: 'Ngân hàng Việt Nam thương tín (VietBank)',
  },
  {
    key: 'pvcombank',
    label: 'Ngân hàng TMCP Đại chúng Việt Nam (PVComBank)',
  },
  {
    key: 'viet-capital-bank',
    label: 'Ngân hàng TCMP Bản Việt (VietCapitalBank)',
  },
  {
    key: 'scvn',
    label: 'Ngân hàng Standard Chartered Bank Việt Nam (SCVN)',
  },
];

export const EPackagingMaterials = {
  PAPER_BOX: 'paper-box',
  PLASTIC_BOX: 'plastic-box',
  BAGASSE_BOX: 'bagasse-box',
  PLASTIC_STYROFOAM: 'plastic-styrofoam',
  HEAT_RETAINING_ALUMINUM_XBOX: 'heat-retaining-aluminum-xbox',
  DEGRADABLE_PLASTIC: 'degradable-plastic',
  REUSABLE_BOX: 'reusable-box',
};

export const PACKAGING_OPTIONS = [
  {
    key: 'packaging-paper-box',
    label: 'Hộp giấy 11',
  },
  {
    key: 'packaging-plastic-box',
    label: 'Hộp nhựa',
  },
  {
    key: 'packaging-bagasse-box',
    label: 'Hộp bã mía',
  },
  {
    key: 'packaging-reusable-box',
    label: 'Hộp ăn tái sử dụng',
  },
  {
    key: 'packaging-heat-retaining-aluminum-xbox',
    label: 'Hộp nhôm giữ nhiệt',
  },
  {
    key: 'packaging-Hộp xuyên thấu',
    label: 'Hộp xuyên thấu',
  },

  {
    key: 'packaging-plastic-styrofoam',
    label: 'Nhựa xốp',
  },
  {
    key: 'packaging-degradable-plastic',
    label: 'Nhựa có thể phân hủy',
  },
  {
    key: 'packaging-Thân thiện với môi trường',
    label: 'Thân thiện với môi trường',
  },
];

export const MEAL_OPTIONS = [
  {
    key: 'breakfast',
    label: 'Ăn sáng',
  },
  {
    key: 'lunch',
    label: 'Ăn trưa',
  },
  {
    key: 'dinner',
    label: 'Ăn tối',
  },
  {
    key: 'brunch',
    label: 'Ăn xế',
  },
  {
    key: 'snack',
    label: 'Ăn vặt',
  },
];

export const MEAL_OPTIONS_WITH_TIME = [
  {
    key: 'breakfast',
    label: 'Ăn sáng (6h30 - 10h30)',
  },
  {
    key: 'lunch',
    label: 'Ăn trưa (10h30 - 14h)',
  },
  {
    key: 'dinner',
    label: 'Ăn tối (16h30 - 22h)',
  },
  {
    key: 'brunch',
    label: 'Ăn xế',
  },
  {
    key: 'snack',
    label: 'Ăn vặt',
  },
];

export const CATEGORY_OPTIONS = [
  {
    key: 'categories-Thuần Việt',
    label: 'Thuần Việt',
    badgeType: EBadgeType.info,
  },
  {
    key: 'categories-Món Bắc',
    label: 'Món Bắc',
    badgeType: EBadgeType.default,
  },
  {
    key: 'categories-Món Trung',
    label: 'Món Trung',
    badgeType: EBadgeType.danger,
  },
  {
    key: 'categories-Món Miền Tây',
    label: 'Món Miền Tây',
    badgeType: EBadgeType.info,
  },
  {
    key: 'categories-Món Hoa',
    label: 'Hoa',
    badgeType: EBadgeType.warning,
  },
  {
    key: 'categories-Món Thái',
    label: 'Thái',
    badgeType: EBadgeType.warning,
  },
  {
    key: 'categories-Món Hàn',
    label: 'Món Hàn',
    badgeType: EBadgeType.success,
  },
  {
    key: 'categories-Món Nhật',
    label: 'Nhật Bản',
    badgeType: EBadgeType.warning,
  },
  {
    key: 'categories-indian-food',
    label: 'Ấn độ',
    badgeType: EBadgeType.success,
  },
  {
    key: 'categories-french-food',
    label: 'Pháp',
    badgeType: EBadgeType.info,
  },
  {
    key: 'categories-mediterranean-food',
    label: 'Địa Trung Hải',
    badgeType: EBadgeType.danger,
  },
  {
    key: 'categories-italian-food',
    label: 'Ý',
    badgeType: EBadgeType.default,
  },
  {
    key: 'categories-barbeque',
    label: 'BBQ',
    badgeType: EBadgeType.success,
  },
  {
    key: 'categories-sea-food',
    label: 'Hải sản',
    badgeType: EBadgeType.success,
  },
  {
    key: 'categories-international-food',
    label: 'Quốc Tế',
    badgeType: EBadgeType.success,
  },
  {
    key: 'categories-Món Âu',
    label: 'Âu',
    badgeType: EBadgeType.success,
  },
  {
    key: 'categories-Món Á',
    label: 'Á',
    badgeType: EBadgeType.success,
  },
  {
    key: 'categories-vegetarian-food',
    label: 'Chay',
    badgeType: EBadgeType.success,
  },
  {
    key: 'categories-macrobiotic-food',
    label: 'Thực dưỡng',
    badgeType: EBadgeType.success,
  },
  {
    key: 'categories-Món Halal',
    label: 'Halal',
    badgeType: EBadgeType.success,
  },
  {
    key: 'categories-keto',
    label: 'keto',
    badgeType: EBadgeType.success,
  },
  {
    key: 'categories-dessert',
    label: 'Tráng miệng',
    badgeType: EBadgeType.success,
  },
  {
    key: 'categories-snack',
    label: 'Ăn vặt',
    badgeType: EBadgeType.success,
  },
];

export const EXTRA_SERVICE_OPTIONS = [
  {
    key: 'print-personalized-labels',
    label: 'In label cá nhân hóa',
  },
  {
    key: 'reusable-box',
    label: 'Hộp tái sử dụng',
  },
  {
    key: 'bagasse-box',
    label: 'Hộp bã mía',
  },
  {
    key: 'delivery-to-the-office',
    label: 'Giao tận văn phòng ',
  },
  {
    key: OTHER_OPTION,
    label: 'Khác',
    hasTextInput: true,
    textPlaceholder: 'Nhập dịch vụ khác',
  },
];

export type TBusinessTypeOptions = {
  key: string;
  label: string;
};

export const BUSINESS_TYPE_OPTIONS: TBusinessTypeOptions[] = [
  {
    key: 'company',
    label: 'Công ty',
  },
  {
    key: 'individualBusinessHouseholds',
    label: 'Loại hình kinh doanh cá thể',
  },
];

export const YES = 'yes';
export const NO = 'no';
export const REGISTERING = 'registering';

export const BUSINESS_LICENSE_OPTIONS = [
  {
    id: 'businessLicense.yes',
    key: YES,
    hasImage: true,
    label: 'Có',
  },
  {
    id: 'businessLicense.registering',
    key: REGISTERING,
    label: 'Đang đăng ký',
  },
  {
    id: 'businessLicense.no',
    key: NO,
    label: 'Chưa',
  },
];

export const FOOD_CERTIFICATE_RADIO_OPTIONS = [
  {
    id: 'foodCertificate.yes',
    key: YES,
    hasImage: true,
    label: 'Có',
  },
  {
    id: 'foodCertificate.registering',
    key: REGISTERING,
    label: 'Đang đăng ký',
  },
  {
    id: 'foodCertificate.no',
    key: NO,
    label: 'Chưa',
  },
];

export const PARTY_INSURANCE_RADIO_OPTIONS = [
  {
    id: 'partyInsurance.yes',
    key: YES,
    hasImage: true,
    label: 'Có',
  },
  {
    id: 'partyInsurance.registering',
    key: REGISTERING,
    label: 'Đang đăng ký',
  },
  {
    id: 'partyInsurance.no',
    key: NO,
    label: 'Chưa',
  },
];

export enum EMenuTypes {
  fixedMenu = 'fixed-menu',
  cycleMenu = 'cycle-menu',
}

export const MENU_OPTIONS = [
  { key: EMenuTypes.fixedMenu, label: 'Menu cố định' },
  { key: EMenuTypes.cycleMenu, label: 'Menu theo chu kỳ' },
];

export enum EOrderStates {
  canceled = 'canceled',
  canceledByBooker = 'canceledByBooker',
  picking = 'picking',
  inProgress = 'inProgress',
  pendingPayment = 'pendingPayment',
  completed = 'completed',
  reviewed = 'reviewed',
  expiredStart = 'expiredStart',
}

export enum EBookerOrderDraftStates {
  bookerDraft = 'bookerDraft',
}
export enum EOrderDraftStates {
  draft = 'draft',
  pendingApproval = 'pendingApproval',
}

export const SPECIAL_DIET_OPTIONS = [
  {
    key: 'low-carb',
    label: 'Low-carb',
    badgeType: EBadgeType.default,
  },
  {
    key: 'keto',
    label: 'Keto',
    badgeType: EBadgeType.info,
  },
  {
    key: 'mediterranean-diet',
    label: 'Mediterranean Diet',
    badgeType: EBadgeType.danger,
  },
  {
    key: 'plant-based',
    label: 'Plant-based',
    badgeType: EBadgeType.warning,
  },
  {
    key: 'halal',
    label: 'Halal',
    badgeType: EBadgeType.success,
  },
  {
    key: 'intermittent-fasting',
    label: 'Intermittent Fasting',
    badgeType: EBadgeType.danger,
  },
  {
    key: 'carnivore-diet',
    label: 'Carnivore Diet',
    badgeType: EBadgeType.default,
  },
  {
    key: 'healthy',
    label: 'Healthy',
    badgeType: EBadgeType.success,
  },
  {
    key: 'paleo-diet',
    label: 'Paleo Diet',
    badgeType: EBadgeType.info,
  },
  {
    key: 'gluten-free',
    label: 'Gluten free',
    badgeType: EBadgeType.success,
  },
  {
    key: OTHER_OPTION,
    label: 'Khác',
    badgeType: EBadgeType.success,
    hasTextInput: true,
    textPlaceholder: 'Nhập chế độ dinh dưỡng',
  },
];

export const SIDE_DISH_OPTIONS = [
  {
    key: 'soup',
    label: 'Món canh',
  },
  {
    key: 'stir-fried-meal',
    label: 'Món xào',
  },
  {
    key: 'dessert',
    label: 'Món tráng miệng',
  },
  {
    key: 'drink',
    label: 'Nước uống',
  },
];

export enum EFoodTypes {
  vegetarianDish = 'vegetarian-dish',
  savoryDish = 'savory-dish',
}

export const FOOD_TYPE_OPTIONS = [
  {
    key: EFoodTypes.vegetarianDish,
    label: 'Món chay',
  },
  {
    key: EFoodTypes.savoryDish,
    label: 'Món mặn',
  },
];

export const ORDER_STATES_OPTIONS = [
  {
    key: EOrderStates.inProgress,
    label: 'Đang triển khai',
  },
  {
    key: EOrderStates.picking,
    label: 'Đang chọn món',
  },
  {
    key: EOrderStates.canceled,
    label: 'Hủy',
  },
  {
    key: EOrderStates.canceledByBooker,
    label: 'Hủy',
  },
  {
    key: EOrderDraftStates.pendingApproval,
    label: 'Mới tạo',
  },
  {
    key: EOrderDraftStates.draft,
    label: 'Đơn nháp',
  },
  {
    key: EBookerOrderDraftStates.bookerDraft,
    label: 'Đơn nháp',
  },
  {
    key: EOrderStates.completed,
    label: 'Chưa đánh giá',
  },
  {
    key: EOrderStates.pendingPayment,
    label: 'Chưa thanh toán',
  },
  {
    key: EOrderStates.reviewed,
    label: 'Đã đánh giá',
  },
  {
    key: EOrderStates.expiredStart,
    label: 'Hết hiệu lực',
  },
];

export const getLabelByKey = (
  list: { key: string; label: string }[],
  key: any,
) => {
  const item = list?.find((l: any) => l.key === key);

  return item && item.label ? item.label : key;
};

export enum EOrderDetailsStatus {
  received = 'received',
  delivered = 'delivered',
  cancelled = 'cancelled',
  pending = 'pending',
}

export enum EMenuStatus {
  active = 'active',
  inactive = 'inactive',
}

export enum EMenuMealType {
  breakfast = 'breakfast',
  lunch = 'lunch',
  dinner = 'dinner',
  snack = 'snack',
}

export const MENU_MEAL_TYPE_OPTIONS = [
  {
    key: EMenuMealType.breakfast,
    label: 'Ăn sáng',
  },
  {
    key: EMenuMealType.lunch,
    label: 'Ăn trưa',
  },
  {
    key: EMenuMealType.dinner,
    label: 'Ăn tối',
  },
  {
    key: EMenuMealType.snack,
    label: 'Ăn xế',
  },
];

export const COMPANY_NUTRITION_TYPE_OPTIONS = [
  {
    key: 'vegeterian',
    label: 'Ăn chay',
  },
  {
    key: 'keto',
    label: 'Keto',
  },
  {
    key: 'non-glucoten',
    label: 'Không chứa glucoten',
  },
];

export enum EManageCompanyOrdersTab {
  ALL = 'all',
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  DRAFT = 'draft',
  CANCELED = 'canceled',
}

export const MANAGE_COMPANY_ORDERS_TAB_MAP = {
  [EManageCompanyOrdersTab.ALL]: [
    EOrderDraftStates.pendingApproval,
    EBookerOrderDraftStates.bookerDraft,
    EOrderStates.picking,
    EOrderStates.inProgress,
    EOrderStates.pendingPayment,
    EOrderStates.completed,
    EOrderStates.reviewed,
    EOrderStates.canceled,
    EOrderStates.expiredStart,
  ],
  [EManageCompanyOrdersTab.SCHEDULED]: [
    EOrderStates.picking,
    EOrderStates.inProgress,
  ],
  [EManageCompanyOrdersTab.COMPLETED]: [
    EOrderStates.completed,
    EOrderStates.reviewed,
    EOrderStates.pendingPayment,
  ],
  [EManageCompanyOrdersTab.DRAFT]: [
    EOrderDraftStates.pendingApproval,
    EBookerOrderDraftStates.bookerDraft,
  ],
  [EManageCompanyOrdersTab.CANCELED]: [
    EOrderStates.canceled,
    EOrderStates.expiredStart,
  ],
};

export enum EAttributeSetting {
  MEAL_STYLES = 'mealStyles',
  NUTRITIONS = 'nutritions',
  DAY_SESSIONS = 'daySessions',
  PACKAGING = 'packaging',
}

export enum ENotificationTypes {
  draftOrder = 'draftOrder',
  completedOrder = 'completedOrder',
  deadlineDueOrder = 'deadlineDueOrder',
  pickingOrder = 'pickingOrder',
}

export enum EOrderDetailTabs {
  ORDER_DETAIL = 'orderDetail',
  QUOTATION = 'quotation',
  PAYMENT_STATUS = 'paymentStatus',
  CHANGE_HISTORY = 'changeHistory',
  REVIEW = 'review',
  CONTRACT = 'contract',
  VAT = 'vat',
}

export const ALLERGIES_OPTIONS = [
  {
    key: 'egg',
    label: 'Trứng',
  },
  {
    key: 'shrimp',
    label: 'Tôm',
  },
  {
    key: 'seafood',
    label: 'Hải sản',
  },
  {
    key: 'msg',
    label: 'Bột ngọt',
  },
  {
    key: 'soy',
    label: 'Đậu nành',
  },
];

export enum ESubOrderTxStatus {
  DELIVERING = 'delivering',
  DELIVERED = 'delivered',
  PENDING = 'pending',
  CANCELED = 'canceled',
}

export enum ESubOrderStatus {
  CANCELED = 'canceled',
}

export enum EOrderHistoryTypes {
  MEMBER_FOOD_CHANGED = 'MEMBER_FOOD_CHANGED',
  MEMBER_FOOD_REMOVED = 'MEMBER_FOOD_REMOVED',
  MEMBER_FOOD_ADDED = 'MEMBER_FOOD_ADDED',
  FOOD_ADDED = 'FOOD_ADDED',
  FOOD_REMOVED = 'FOOD_REMOVED',
  FOOD_INCREASED = 'FOOD_INCREASED',
  FOOD_DECREASED = 'FOOD_DECREASED',
}

export enum EQuotationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum ENotificationType {
  INVITATION = 'INVITATION',
  COMPANY_JOINED = 'COMPANY_JOINED',
  ORDER_SUCCESS = 'ORDER_SUCCESS',
  ORDER_CANCEL = 'ORDER_CANCEL',
  ORDER_DELIVERING = 'ORDER_DELIVERING',
  ORDER_PICKING = 'ORDER_PICKING',
  ORDER_RATING = 'ORDER_RATING',

  SUB_ORDER_UPDATED = 'SUB_ORDER_UPDATED',
  SUB_ORDER_INPROGRESS = 'SUB_ORDER_INPROGRESS',
  SUB_ORDER_CANCELED = 'SUB_ORDER_CANCELED',
  SUB_ORDER_DELIVERED = 'SUB_ORDER_DELIVERED',
  SUB_ORDER_DELIVERING = 'SUB_ORDER_DELIVERING',
  SUB_ORDER_REVIEWED_BY_BOOKER = 'SUB_ORDER_REVIEWED_BY_BOOKER',
  SUB_ORDER_REVIEWED_BY_PARTICIPANT = 'SUB_ORDER_REVIEWED_BY_PARTICIPANT',
  PARTNER_MENU_CREATED_BY_ADMIN = 'PARTNER_MENU_CREATED_BY_ADMIN',
  PARTNER_FOOD_CREATED_BY_ADMIN = 'PARTNER_FOOD_CREATED_BY_ADMIN',
  PARTNER_PROFILE_UPDATED_BY_ADMIN = 'PARTNER_PROFILE_UPDATED_BY_ADMIN',
}
export enum ENotificationPopupTypes {
  success = 'success',
  warning = 'warning',
  error = 'error',
}

export const ORDER_ADMIN_FILTER_OPTIONS = [
  {
    key: 'draft',
    label: 'Đơn nháp',
  },
  {
    key: 'pendingApproval',
    label: 'Mới tạo',
  },
  {
    key: 'picking',
    label: 'Đang chọn món',
  },
  {
    key: 'inProgress',
    label: 'Đang triển khai',
  },
  {
    key: 'pendingPayment',
    label: 'Chưa thanh toán',
  },
  {
    key: 'completed',
    label: 'Đã thanh toán',
  },
  {
    key: 'canceled',
    label: 'Hủy đơn',
  },
];

export enum EPaymentStatus {
  SUCCESS = 'success',
}

export enum EPaymentType {
  PARTNER = 'partner',
  CLIENT = 'client',
}

export enum EPartnerVATSetting {
  vat = 'vat',
  noExportVat = 'noExportVat',
  direct = 'direct',
}

export enum EOrderPaymentState {
  isPaid = 'isPaid',
  isNotPaid = 'isNotPaid',
}
