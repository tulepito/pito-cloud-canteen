import { types as sdkLoader } from '@sharetribe/sdk';
import type { adminRoutes } from '@src/paths';
import type Decimal from 'decimal.js';
import type { NextPage } from 'next';

import type {
  EAvailabilityPlans,
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

const { UUID, LatLng, Money } = sdkLoader;

export type TObject = Record<string, any>;
export type ReverseMap<T> = T[keyof T];
export type TReverseMapFromEnum<T> = T[keyof T];
export type NextApplicationPage<P = any, IP = P> = NextPage<P, IP> & {
  requireAuth?: boolean;
};

// API error
// TODO this is likely to change soonish
export type TErrorCode = TReverseMapFromEnum<typeof EErrorCode>;
export type TSharetribeFlexSdkApiError = {
  id: typeof UUID;
  status: number;
  code: TErrorCode;
  title: string;
  meta: TObject;
};
export type TError = {
  type: 'error';
  name: string;
  message?: string;
  status?: number;
  statusText: string;
  apiErrors: TSharetribeFlexSdkApiError[];
};

export type TIconProps = {
  className?: string;
  rootClassName?: string;
  width?: number;
  height?: number;
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
  id: typeof UUID;
  type: 'image';
  attributes: TImageAttributes;
};

export type TProfile = {
  firstName: string;
  lastName: string;
  displayName: string;
  abbreviatedName: string;
  bio?: string;
  protectedData?: TObject;
  metadata?: TObject;
  publicData?: TObject;
  privateData?: TObject;
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
  id: typeof UUID;
  type: 'currentUser';
  attributes: TCurrentUserAttributes;
  profileImage: TImage;
};

export type TUserProfile = {
  displayName: string;
  abbreviatedName: string;
  bio?: string;
  protectedData?: TObject;
  metadata?: TObject;
  publicData?: TObject;
};

export type TUserAttributes = {
  banned: boolean;
  deleted: boolean;
  email: string;
  profile: TUserProfile;
};

export type TCompanyProfile = {
  displayName: string;
  firstName: string;
  lastName: string;
  abbreviatedName: string;
  bio?: string;
  protectedData?: TObject;
  metadata?: TObject;
  publicData?: TObject;
  privateData?: TObject;
};

export type TCompanyAttributes = {
  banned: boolean;
  deleted: boolean;
  email: string;
  profile: TCompanyProfile;
};

// Listing queries can include author.
// Banned and deleted are not relevant then
// since banned and deleted users can't have listings.

export type TAuthorProfile = {
  displayName: string;
  abbreviatedName: string;
  bio?: string;
  protectedData?: TObject;
  metadata?: TObject;
  publicData?: TObject;
  privateData?: TObject;
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
  id: typeof UUID;
  type: 'user';
  attributes: TAuthorAttributes &
    TBannedUserAttributes &
    TDeletedUserAttributes &
    TUserAttributes;
  profileImage: TImage;
};

export type TCompany = {
  id: typeof UUID;
  type: 'user';
  attributes: TAuthorAttributes &
    TBannedUserAttributes &
    TDeletedUserAttributes &
    TCompanyAttributes;
  profileImage: TImage;
};

export type TListingState = TReverseMapFromEnum<typeof EListingStates>;

export type TListingAttributes = {
  title: string;
  description?: string;
  geolocation?: typeof LatLng;
  deleted?: boolean;
  state?: TListingState;
  price?: typeof Money;
  publicData: TObject;
};

export type TDayOfWeek = TReverseMapFromEnum<typeof EDayOfWeek>;

export type TAvailabilityPlanEntries = {
  dayOfWeek: TDayOfWeek;
  seats: number;
  start?: string;
  end?: string;
};

export type TAvailabilityPlanType = TReverseMapFromEnum<
  typeof EAvailabilityPlans
>;

export type TAvailabilityPlan = {
  type: TAvailabilityPlanType;
  timezone: string;
  entries: TAvailabilityPlanEntries[];
};

export type TOwnListingAttributes = {
  title: string;
  deleted: boolean;
  state: TListingState;
  price?: typeof Money;
  publicData: TObject;
  availabilityPlan?: TAvailabilityPlan;
  description?: string;
  geolocation?: typeof LatLng;
};

export type TDeletedListingAttributes = {
  deleted: boolean;
};

// Denormalised listing object
export type TListing = {
  id: typeof UUID;
  type: 'listing';
  attributes: TListingAttributes & TDeletedListingAttributes;
  author?: TUser;
  images?: TImage[];
};

// Denormalised ownListing object
export type TOwnListing = {
  id: typeof UUID;
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
  id: typeof UUID;
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
  id: typeof UUID;
  type: 'timeSlot';
  attributes: TTimeSlotAttributes;
};

export type TAvailabilityExceptionAttributes = {
  seats: number;
  end: Date;
  start: Date;
};

export type TAvailabilityException = {
  id: typeof UUID;
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
  id: typeof UUID;
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
  unitPrice: typeof Money;
  lineTotal: typeof Money;
  reversal: boolean;
};

export type TTransactionAttributes = {
  createdAt?: Date;
  lastTransitionedAt: Date;
  lastTransition: string;

  // An enquiry won't need a total sum nor a booking so these are
  // optional.
  payinTotal?: typeof Money;
  payoutTotal?: typeof Money;
  lineItems: TLineItem[];
  transitions: TTransition[];
};

export type TTransaction = {
  id: typeof UUID;
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
  id: typeof UUID;
  type: 'message';
  attributes: TMessageAttributes;
  sender: TUser;
};

// Pagination information in the response meta
export type TPagination = {
  page: number;
  perPage: number;
  paginationUnsupported?: boolean;
  totalItems: number;
  totalPages: number;
};

export type TFormEvent = React.FormEvent<HTMLInputElement>;
export type TInputAttributes = React.HTMLAttributes<HTMLInputElement>;
export type TFormLabel =
  | React.ReactElement<React.ComponentProps<'label'>>
  | string;

export type RouteKey = keyof typeof adminRoutes;
