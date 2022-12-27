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
  penddingArroval = 'pendingApproval',
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
  transaction = 'transaction',
}

export enum ERestaurantListingState {
  draft = 'draft',
  published = 'published',
  deleted = 'deleted',
}

export const OTHER_OPTION = 'other';

export const LIST_BANKS = [
  {
    key: 'ncb',
    label: 'Ngân hàng NCB',
  },
  {
    key: 'vcb',
    label: 'Ngân hàng Vietcombank',
  },
  {
    key: 'techcombank',
    label: 'Ngân hàng Techcombank',
  },
];

export const PACKAGING_OPTIONS = [
  {
    key: 'paper-box',
    label: 'Hộp giấy',
  },
  {
    key: 'plastic-box',
    label: 'Hộp nhựa',
  },
  {
    key: 'bagasse-box',
    label: 'Hộp bã mía',
  },
  {
    key: 'reusable-box',
    label: 'Hộp ăn tái sử dụng',
  },
  {
    key: OTHER_OPTION,
    label: 'Khác',
    hasTextInput: true,
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
  },
  {
    key: 'vietnam-north-food',
    label: 'Món Bắc',
  },
  {
    key: 'vietnam-centrel-food',
    label: 'Món Trung',
  },
  {
    key: 'vietnam-west-food',
    label: 'Món Miền Tây',
  },
  {
    key: 'chinese-food',
    label: 'Hoa',
  },
  {
    key: 'thai-food',
    label: 'Thái',
  },
  {
    key: 'korean-food',
    label: 'Hàn quốc',
  },
  {
    key: 'japanes-food',
    label: 'Nhật Bản',
  },
  {
    key: 'indian-food',
    label: 'Ấn độ',
  },
  {
    key: 'frech-food',
    label: 'Pháp',
  },
  {
    key: 'mediterranean-food',
    label: 'Địa Trung Hải',
  },
  {
    key: 'italian-food',
    label: 'Ý',
  },
  {
    key: 'barbeque',
    label: 'BBQ',
  },
  {
    key: 'sea-food',
    label: 'Hải sản',
  },
  {
    key: 'international-food',
    label: 'Quốc Tế',
  },
  {
    key: 'europe-food',
    label: 'Âu',
  },
  {
    key: 'asian-food',
    label: 'Á',
  },
  {
    key: 'vegetarian-food',
    label: 'Chay',
  },
  {
    key: 'macrobiotic-food',
    label: 'Thực dưỡng',
  },
  {
    key: 'halal',
    label: 'Halal',
  },
  {
    key: 'keto',
    label: 'keto',
  },
  {
    key: 'dessert',
    label: 'Tráng miệng',
  },
  {
    key: 'snack',
    label: 'Ăn vặt',
  },
  {
    key: OTHER_OPTION,
    label: 'Khác',
    hasTextInput: true,
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
  },
];
