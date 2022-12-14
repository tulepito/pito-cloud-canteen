// Options for showing just date or date and time on BookingTimeInfo and BookingBreakdown
// export const DATE_TYPE_DATE = 'date';
// export const DATE_TYPE_DATETIME = 'datetime';

// propTypes.dateType = oneOf([DATE_TYPE_DATE, DATE_TYPE_DATETIME]);
import type Decimal from 'decimal.js';

import type {
  EBookingStates,
  EDayOfWeek,
  EErrorCode,
  EImageVariants,
  EListingStates,
  EReviewRatings,
  EReviewTypes,
  ETimeSlots,
  ETransactionRoles,
  ETxTransitionActors,
} from './enums';

export enum ErrorCodes {
  ERROR_CODE_TRANSACTION_LISTING_NOT_FOUND = 'transaction-listing-not-found',
  ERROR_CODE_TRANSACTION_INVALID_TRANSITION = 'transaction-invalid-transition',
  ERROR_CODE_TRANSACTION_ALREADY_REVIEWED_BY_CUSTOMER = 'transaction-already-reviewed-by-customer',
  ERROR_CODE_TRANSACTION_ALREADY_REVIEWED_BY_PROVIDER = 'transaction-already-reviewed-by-provider',
  ERROR_CODE_TRANSACTION_BOOKING_TIME_NOT_AVAILABLE = 'transaction-booking-time-not-available',
  ERROR_CODE_PAYMENT_FAILED = 'transaction-payment-failed',
  ERROR_CODE_CHARGE_ZERO_PAYIN = 'transaction-charge-zero-payin',
  ERROR_CODE_CHARGE_ZERO_PAYOUT = 'transaction-charge-zero-payout',
  ERROR_CODE_EMAIL_TAKEN = 'email-taken',
  ERROR_CODE_EMAIL_NOT_FOUND = 'email-not-found',
  ERROR_CODE_TOO_MANY_VERIFICATION_REQUESTS = 'email-too-many-verification-requests',
  ERROR_CODE_UPLOAD_OVER_LIMIT = 'request-upload-over-limit',
  ERROR_CODE_VALIDATION_INVALID_PARAMS = 'validation-invalid-params',
  ERROR_CODE_VALIDATION_INVALID_VALUE = 'validation-invalid-value',
  ERROR_CODE_NOT_FOUND = 'not-found',
  ERROR_CODE_FORBIDDEN = 'forbidden',
  ERROR_CODE_MISSING_STRIPE_ACCOUNT = 'transaction-missing-stripe-account',
}

// API error
// TODO this is likely to change soonish
export type TApiError = {
  id: String;
  status: Number;
  code: ErrorCodes;
  title: String;
  meta: Record<string, unknown>;
};

// Storable error prop type. (Error object should not be stored as it is.)
export type TError = {
  type: 'error';
  name: String;
  message?: String;
  status?: Number;
  statusText: String;
  apiErrors: TApiError[];
};

export type TReverseMapFromEnum<T> = T[keyof T];

export type TIconProps = {
  className?: string;
  rootClassName?: string;
  onClick?: () => void;
};

// Sharetribe Flex Entity Types

export type TImageVariantAttributes = {
  width: number;
  height: number;
  url: string;
};

export type TImageVariant = TReverseMapFromEnum<typeof EImageVariants>;

export type TImageAttributes = {
  variants: Record<EImageVariants, TImageVariantAttributes>;
};

export type TImage = {
  id: any;
  type: 'image';
  attributes: TImageAttributes;
};

export type TProfile = {
  firstName: string;
  lastName: string;
  displayName: string;
  abbreviatedName: string;
  bio?: string;
};

export type TCurrentUserAttributes = {
  banned: boolean;
  email: string;
  deleted: boolean;
  emailVerified: boolean;
  profile: TProfile;
  stripeConnected?: boolean;
};

export type TCurrentUser = {
  id: any;
  type: 'currentUser';
  attributes: TCurrentUserAttributes;
  profileImage: TImage;
};

export type TUserProfile = {
  displayName: string;
  abbreviatedName: string;
  bio?: string;
};

export type TUserAttributes = {
  banned: boolean;
  deleted: boolean;
  profile: TUserProfile;
};

// Listing queries can include author.
// Banned and deleted are not relevant then
// since banned and deleted users can't have listings.

export type TAuthorProfile = {
  displayName: string;
  abbreviatedName: string;
  bio?: string;
};

export type TAuthorAttributes = {
  profile: TAuthorProfile;
};

export type TDeletedUserAttributes = {
  deleted: boolean;
};

export type TBannedUserAttributes = {
  banned: boolean;
};

export type TUser = {
  id: any;
  type: 'user';
  attributes: TAuthorAttributes &
    TBannedUserAttributes &
    TDeletedUserAttributes &
    TUserAttributes;
  profileImage: TImage;
};

export type TListingState = TReverseMapFromEnum<typeof EListingStates>;

export type TListingAttributes = {
  title: string;
  description?: string;
  geolocation?: any;
  deleted?: boolean;
  state?: TListingState;
  price?: any;
  publicData?: object;
};

export type TDayOfWeek = TReverseMapFromEnum<typeof EDayOfWeek>;

export type TAvailabilityPlanEntries = {
  dayOfWeek: TDayOfWeek;
  seats: number;
  start?: string;
  end?: string;
};

export type TAvailabilityPlanType = TReverseMapFromEnum<typeof EDayOfWeek>;

export type TAvailabilityPlan = {
  type: TAvailabilityPlanType;
  timezone: string;
  entries: TAvailabilityPlanEntries;
};

export type TOwnListingAttributes = {
  title: string;
  deleted: boolean;
  state: TListingState;
  price?: any;
  publicData: object;
  availabilityPlan?: TAvailabilityPlan;
  description?: string;
  geolocation?: any;
};

export type TDeletedListingAttributes = {
  deleted: boolean;
};

// Denormalised listing object
export type TListing = {
  id: any;
  type: 'listing';
  attributes: TListingAttributes & TDeletedListingAttributes;
  author?: TUser;
  images?: TImage[];
};

// Denormalised ownListing object
export type TOwnListing = {
  id: any;
  type: 'ownListing';
  attributes: TOwnListingAttributes & TDeletedListingAttributes;
  author?: TUser;
  images?: TImage[];
};

export type TBookingState = TReverseMapFromEnum<typeof EBookingStates>;

export type TBookingAttributes = {
  end: Date;
  start: Date;
  displayStart: Date;
  displayEnd: Date;
  state: TBookingState;
};

export type TBooking = {
  id: any;
  type: 'booking';
  attributes: TBookingAttributes;
};

export type TTimeSlotType = TReverseMapFromEnum<typeof ETimeSlots>;

export type TTimeSlotAttributes = {
  type: TTimeSlotType;
  end: Date;
  start: Date;
};

export type TTimeSlot = {
  id: any;
  type: 'timeSlot';
  attributes: TTimeSlotAttributes;
};

export type TAvailabilityExceptionAttributes = {
  seats: number;
  end: Date;
  start: Date;
};

export type TAvailabilityException = {
  id: any;
  type: 'availabilityException';
  attributes: TAvailabilityExceptionAttributes;
};

export type TTxTransitionActors = TReverseMapFromEnum<
  typeof ETxTransitionActors
>;

export type TTransition = {
  createdAt: Date;
  by: TTxTransitionActors;
  // Transition will define later
  transition: string[];
};

export type TReviewRating = TReverseMapFromEnum<typeof EReviewRatings>;
export type TReviewType = TReverseMapFromEnum<typeof EReviewTypes>;

export type TReviewAttributes = {
  createdAt: Date;
  content: string;
  rating: TReviewRating;
  state: string;
  type: TReviewType;
};

export type TReview = {
  id: any;
  attributes: TReviewAttributes;
  author: TUser;
  subject: TUser;
};

export type TLineItemCode = `line-item/${string}`;

export type TTransactionRole = TReverseMapFromEnum<typeof ETransactionRoles>;

export type TLineItem = {
  code: TLineItemCode;
  includeFor: TTransactionRole;
  quantity?: Decimal;
  unitPrice: any;
  lineTotal: any;
  reversal: boolean;
};

export type TTransactionAttributes = {
  createdAt?: Date;
  lastTransitionedAt: Date;
  lastTransition: string;

  // An enquiry won't need a total sum nor a booking so these are
  // optional.
  payinTotal?: any;
  payoutTotal?: any;
  lineItems: TLineItem[];
  transitions: TTransition[];
};

export type TTransaction = {
  id: any;
  type: 'transaction';
  attributes: TTransactionAttributes;
  booking: TBooking;
  listing: TListing;
  customer: TUser;
  provider: TUser;
  reviews: TReview[];
};

export type TMessageAttributes = {
  createdAt: Date;
  content: string;
};

// Denormalised transaction message
export type TMessage = {
  id: any;
  type: 'message';
  attributes: TMessageAttributes;
  sender: TUser;
};

// Pagination information in the response meta
export type TPagination = {
  page: number;
  perPage: number;
  paginationUnsupported: boolean;
  totalItems: number;
  totalPages: number;
};

export type TErrorCode = TReverseMapFromEnum<typeof EErrorCode>;
