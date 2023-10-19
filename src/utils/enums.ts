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

export enum EReviewType {
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

export enum EUserSystemPermission {
  normal = 'normal',
  admin = 'admin',
  company = 'company',
  partner = 'partner',
}

export enum ECompanyPermission {
  owner = 'owner',
  booker = 'booker',
  participant = 'participant',
  accountant = 'accountant',
}

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

export const EPackagingMaterials = {
  PAPER_BOX: 'paper-box',
  PLASTIC_BOX: 'plastic-box',
  BAGASSE_BOX: 'bagasse-box',
  PLASTIC_STYROFOAM: 'plastic-styrofoam',
  HEAT_RETAINING_ALUMINUM_XBOX: 'heat-retaining-aluminum-xbox',
  DEGRADABLE_PLASTIC: 'degradable-plastic',
  REUSABLE_BOX: 'reusable-box',
};

export enum EMenuType {
  fixedMenu = 'fixed-menu',
  cycleMenu = 'cycle-menu',
}

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

export enum EFoodType {
  vegetarianDish = 'vegetarian-dish',
  savoryDish = 'savory-dish',
}

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

export enum ECompanyDashboardNotificationType {
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

export enum ESubOrderTxStatus {
  DELIVERING = 'delivering',
  DELIVERED = 'delivered',
  PENDING = 'pending',
  CANCELED = 'canceled',
}

export enum ESubOrderStatus {
  CANCELED = 'canceled',
}

export enum EEditSubOrderHistoryType {
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
export enum ENotificationPopupType {
  success = 'success',
  warning = 'warning',
  error = 'error',
}

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
