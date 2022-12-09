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

export type ReverseMap<T> = T[keyof T];

export type TIconProps = {
  className?: string;
};

// Sharetribe Flex Entity Types

export type TImageVariantAttributes = {
  width: number;
  height: number;
  url: string;
};

export type TImageVariant = ReverseMap<typeof EImageVariants>;

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

export type TListingState = ReverseMap<typeof EListingStates>;

export type TListingAttributes = {
  title: string;
  description?: string;
  geolocation?: any;
  deleted?: boolean;
  state?: TListingState;
  price?: any;
  publicData?: object;
};

export type TDayOfWeek = ReverseMap<typeof EDayOfWeek>;

export type TAvailabilityPlanEntries = {
  dayOfWeek: TDayOfWeek;
  seats: number;
  start?: string;
  end?: string;
};

export type TAvailabilityPlanType = ReverseMap<typeof EDayOfWeek>;

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

export type TBookingState = ReverseMap<typeof EBookingStates>;

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

export type TTimeSlotType = ReverseMap<typeof ETimeSlots>;

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

export type TTxTransitionActors = ReverseMap<typeof ETxTransitionActors>;

export type TTransition = {
  createdAt: Date;
  by: TTxTransitionActors;
  // Transition will define later
  transition: string[];
};

export type TReviewRating = ReverseMap<typeof EReviewRatings>;
export type TReviewType = ReverseMap<typeof EReviewTypes>;

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

export type TTransactionRole = ReverseMap<typeof ETransactionRoles>;

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

export type TErrorCode = ReverseMap<typeof EErrorCode>;

// API error
// TODO this is likely to change soonish
export type TSharetribeFlexSdkApiError = {
  id: any;
  status: number;
  code: TErrorCode;
  title: string;
  meta?: object;
};

export type TError = {
  type: 'error';
  name: string;
  message?: string;
  status?: number;
  statusText: string;
  apiErrors: TSharetribeFlexSdkApiError[];
};
