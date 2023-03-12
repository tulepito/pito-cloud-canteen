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
}

export enum ECompanyStatus {
  active = 1,
  unactive = 0,
}

export enum EListingType {
  restaurant = 'restaurant',
  food = 'food',
  menu = 'menu',
  subOrder = 'sub-order',
  order = 'order',
}

export enum EUserPermission {
  company = 'company',
  admin = 'admin',
  normal = 'normal',
}

export enum ECompanyMemberPermission {
  owner = 'owner',
}

export const startRouteBaseOnPermission = {
  [EUserPermission.company]: '/company',
  [EUserPermission.admin]: '/admin',
};

export enum ERestaurantListingStatus {
  new = 'new',
  authorized = 'authorized',
  unsatisfactory = 'unsatisfactory',
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
    key: EPackagingMaterials.PAPER_BOX,
    label: 'Hộp giấy',
  },
  {
    key: EPackagingMaterials.PLASTIC_BOX,
    label: 'Nhựa xốp',
  },
  {
    key: EPackagingMaterials.BAGASSE_BOX,
    label: 'Hộp bã mía',
  },
  {
    key: EPackagingMaterials.HEAT_RETAINING_ALUMINUM_XBOX,
    label: 'Hộp nhôm giữ nhiệt',
  },
  {
    key: EPackagingMaterials.DEGRADABLE_PLASTIC,
    label: 'Nhựa có thể phân hủy',
  },
  {
    key: EPackagingMaterials.REUSABLE_BOX,
    label: 'Hộp ăn tái sử dụng',
  },
  {
    key: OTHER_OPTION,
    label: 'Khác',
    hasTextInput: true,
    textPlaceholder: 'Nhập bao bì thường sử dụng',
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

export const CATEGORY_OPTIONS = [
  {
    key: 'vietnam-food',
    label: 'Thuần Việt',
    badgeType: EBadgeType.info,
  },
  {
    key: 'vietnam-north-food',
    label: 'Món Bắc',
    badgeType: EBadgeType.default,
  },
  {
    key: 'vietnam-centrel-food',
    label: 'Món Trung',
    badgeType: EBadgeType.danger,
  },
  {
    key: 'vietnam-west-food',
    label: 'Món Miền Tây',
    badgeType: EBadgeType.info,
  },
  {
    key: 'chinese-food',
    label: 'Hoa',
    badgeType: EBadgeType.warning,
  },
  {
    key: 'thai-food',
    label: 'Thái',
    badgeType: EBadgeType.warning,
  },
  {
    key: 'korean-food',
    label: 'Hàn quốc',
    badgeType: EBadgeType.success,
  },
  {
    key: 'japanese-food',
    label: 'Nhật Bản',
    badgeType: EBadgeType.warning,
  },
  {
    key: 'indian-food',
    label: 'Ấn độ',
    badgeType: EBadgeType.success,
  },
  {
    key: 'french-food',
    label: 'Pháp',
    badgeType: EBadgeType.info,
  },
  {
    key: 'mediterranean-food',
    label: 'Địa Trung Hải',
    badgeType: EBadgeType.danger,
  },
  {
    key: 'italian-food',
    label: 'Ý',
    badgeType: EBadgeType.default,
  },
  {
    key: 'barbeque',
    label: 'BBQ',
    badgeType: EBadgeType.success,
  },
  {
    key: 'sea-food',
    label: 'Hải sản',
    badgeType: EBadgeType.success,
  },
  {
    key: 'international-food',
    label: 'Quốc Tế',
    badgeType: EBadgeType.success,
  },
  {
    key: 'europe-food',
    label: 'Âu',
    badgeType: EBadgeType.success,
  },
  {
    key: 'asian-food',
    label: 'Á',
    badgeType: EBadgeType.success,
  },
  {
    key: 'vegetarian-food',
    label: 'Chay',
    badgeType: EBadgeType.success,
  },
  {
    key: 'macrobiotic-food',
    label: 'Thực dưỡng',
    badgeType: EBadgeType.success,
  },
  {
    key: 'halal',
    label: 'Halal',
    badgeType: EBadgeType.success,
  },
  {
    key: 'keto',
    label: 'keto',
    badgeType: EBadgeType.success,
  },
  {
    key: 'dessert',
    label: 'Tráng miệng',
    badgeType: EBadgeType.success,
  },
  {
    key: 'snack',
    label: 'Ăn vặt',
    badgeType: EBadgeType.success,
  },
  {
    key: OTHER_OPTION,
    label: 'Khác',
    hasTextInput: true,
    textPlaceholder: 'Nhập phong cách ẩm thực khác',
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
  },

  {
    key: 'keto',
    label: 'Keto',
  },
  {
    key: 'mediterranean-diet',
    label: 'Mediterranean Diet',
  },
  {
    key: 'plant-based',
    label: 'Plant-based',
  },
  {
    key: 'halal',
    label: 'Halal',
  },
  {
    key: 'intermittent-fasting',
    label: 'Intermittent Fasting',
  },
  {
    key: 'carnivore-diet',
    label: 'Carnivore Diet',
  },
  {
    key: 'healthy',
    label: 'Healthy',
  },
  {
    key: 'paleo-diet',
    label: 'Paleo Diet',
  },
  {
    key: 'gluten-free',
    label: 'Gluten free',
  },
  {
    key: OTHER_OPTION,
    label: 'Khác',
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
    label: 'Đơn mới',
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
  [EManageCompanyOrdersTab.CANCELED]: [EOrderStates.canceled],
};
