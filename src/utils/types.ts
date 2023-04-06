import type Decimal from 'decimal.js';
import type { NextPage } from 'next';

import { types as sdkLoader } from '@sharetribe/sdk';
import type { adminRoutes } from '@src/paths';

import type {
  EAvailabilityPlans,
  EBookerOrderDraftStates,
  EBookingStates,
  EDayOfWeek,
  EErrorCode,
  EImageVariants,
  EListingStates,
  EManageCompanyOrdersTab,
  EMenuMealType,
  EMenuTypes,
  ENotificationTypes,
  EOrderDraftStates,
  EOrderStates,
  EReviewRatings,
  EReviewTypes,
  ETimeSlots,
  ETransactionRoles,
  ETxTransitionActors,
} from './enums';
import type { ETransition } from './transaction';

const { UUID, LatLng, Money } = sdkLoader;

export type TObject<
  K extends string | number | symbol = string,
  V = any,
> = Record<K, V>;
export type NextApplicationPage<P = any, IP = P> = NextPage<P, IP> & {
  requireAuth?: boolean;
};

// API error
// TODO this is likely to change soonish
export type TErrorCode = EErrorCode;
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
/* =============== Props =============== */

export type TDefaultProps = { className?: string; rootClassName?: string };

export type TIconProps = TDefaultProps & {
  width?: number;
  height?: number;
  onClick?: (e?: any) => void;
};

// Sharetribe Flex Entity Types

export type TImageVariantAttributes = {
  width: number;
  height: number;
  url: string;
};

export type TImageVariant = EImageVariants;

export type TImageAttributes = {
  variants: Record<EImageVariants, TImageVariantAttributes>;
};

export type TImage = {
  id: typeof UUID;
  type: 'image';
  attributes: TImageAttributes;
};

/* =============== Profile type =============== */
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

export type TBookerAttributes = {
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

export type TBooker = {
  id: typeof UUID;
  type: 'user';
  attributes: TAuthorAttributes &
    TBannedUserAttributes &
    TDeletedUserAttributes &
    TBookerAttributes;
  profileImage: TImage;
};

export type TListingState = EListingStates;

export type TListingAttributes = {
  title: string;
  description?: string;
  geolocation?: typeof LatLng;
  deleted?: boolean;
  state?: TListingState;
  price?: typeof Money;
  publicData: TObject;
  metadata: TObject;
};

export type TDayOfWeek = EDayOfWeek;

export type TAvailabilityPlanEntries = {
  dayOfWeek: TDayOfWeek;
  seats: number;
  start?: string;
  end?: string;
};

export type TAvailabilityPlanType = EAvailabilityPlans;

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

export type TBookingState = EBookingStates;

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

export type TTimeSlotType = ETimeSlots;

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

export type TTxTransitionActors = ETxTransitionActors;

export type TTransition = {
  createdAt: Date;
  by: TTxTransitionActors;
  // Transition will define later
  transition: ETransition;
};

export type TReviewRating = EReviewRatings;
export type TReviewType = EReviewTypes;

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

export type TTransactionRole = ETransactionRoles;

export type TLineItem = {
  code: TLineItemCode;
  includeFor: TTransactionRole;
  quantity?: Decimal;
  unitPrice: typeof Money;
  lineTotal: typeof Money;
  reversal: boolean;
};

export type TTransactionReviews = {
  [participantId: string]: {
    reviewContent: string;
    reviewRating: number;
    authorId: string;
  };
};

export type TTransactionAttributes = {
  createdAt?: Date;
  lastTransitionedAt: Date;
  lastTransition: ETransition;

  // An enquiry won't need a total sum nor a booking so these are
  // optional.
  payinTotal?: typeof Money;
  payoutTotal?: typeof Money;
  lineItems: TLineItem[];
  transitions: TTransition[];
  metadata: {
    orderId: string;
    planId: string;
    participantIds?: string[];
    reviews?: TTransactionReviews;
  };
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

export type AdminRouteKey = keyof typeof adminRoutes;

export type TAddress = {
  predictions: any[];
  search: string;
  selectedPlace: {
    address: string;
    origin: {
      lat: number;
      lng: number;
    };
    bounds?: {
      ne: {
        lat: number;
        lng: number;
      };
      sw: {
        lat: number;
        lng: number;
      };
    };
  };
};

export type TAdminListingAttributes = {
  title: string;
  description?: string;
  geolocation?: any;
  deleted?: boolean;
  state?: TListingState;
  price?: any;
  publicData?: any;
  metadata?: any;
  privateData?: any;
};

export type TOrderListing = {
  id: any;
  type: 'listing';
  attributes: TListingAttributes & TDeletedListingAttributes;
  author?: TUser;
  images?: TImage[];
};

// Denormalised integration order listing object

export type TIntegrationListing = {
  id: any;
  type: 'listing';
  attributes: TAdminListingAttributes & TDeletedListingAttributes;
  author?: TUser;
  images?: TImage[];
  company?: TCompany;
  plan?: TListing;
  order?: TOrderListing;
};

export type TIntegrationOrderListing = {
  id: any;
  type: 'listing';
  attributes: TAdminListingAttributes & TDeletedListingAttributes;
  author?: TUser;
  images?: TImage[];
  company?: TCompany;
  booker?: TBooker;
  plan?: TListing;
  subOrders?: TIntegrationListing[];
};

export type TCompanyMemberWithDetails = {
  permission: string;
  groups: string[];
  email: string;
  expireTime: Date;
  id: null;
  inviteStatus: string;
} & TUser;

export type TCompanyGroup = {
  id: string;
  name: string;
  description?: string;
  members: {
    id: string | null;
    email: string;
  }[];
};

export type TTableSortValue = {
  columnName: string;
  type: 'asc' | 'desc';
};

export type TOrderStateHistory = {
  state: EOrderStates | EOrderDraftStates | EBookerOrderDraftStates;
  updatedAt: number;
};

export type TOrderStateCountMap = {
  [EManageCompanyOrdersTab.SCHEDULED]: number;
  [EManageCompanyOrdersTab.CANCELED]: number;
  [EManageCompanyOrdersTab.DRAFT]: number;
  [EManageCompanyOrdersTab.COMPLETED]: number;
  [EManageCompanyOrdersTab.ALL]: number;
};

export type TCompanyOrderNoticationMap = {
  [ENotificationTypes.completedOrder]: TListing | null;
  [ENotificationTypes.deadlineDueOrder]: TListing | null;
  [ENotificationTypes.draftOrder]: TListing | null;
  [ENotificationTypes.pickingOrder]: TListing | null;
};

export type TCompanyOrderSummary = {
  totalOrderDishes: number;
  totalOrderCost: number;
};

export type TScenarioRating = {
  rating: number;
  optionalRating?: string[];
  optionalOtherReview?: string;
};

export type TRestaurantRating = {
  orderId: string;
  restaurantId: string;
  reviewerId: string;
  timestamp: number;
  generalRating: number;
  detailReview?: string;
  detailRating?: {
    food?: TScenarioRating;
    packaging?: TScenarioRating;
  };
};
export type TKeyValue<T = string> = {
  key: string;
  label: T;
  time?: {
    start: string;
    end: string;
  };
};

export type TCreateCompanyApiParams = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyEmail: string;
  companyLocation: TObject;
  companyName: string;
  phoneNumber: string;
  location: TObject;
  note: string;
  tax: string;
};

export type TUpdateCompanyApiParams = {
  id: string;
  firstName: string;
  lastName: string;
  companyEmail: string;
  companyLocation: TObject;
  companyName: string;
  phoneNumber: string;
  location: TObject;
  note: string;
  tax: string;
  profileImageId: string;
  nutritions: string[];
  bankAccounts: TObject[];
  paymentDueDays: number;
  include?: string[];
};

export type TCreateMenuApiParams = {
  menuType: EMenuTypes;
  mealType: EMenuMealType;
  startDate: number;
  daysOfWeek: EDayOfWeek[];
  restaurantId: string;
  title: string;
  numberOfCycles: number;
  endDate: number;
};

export type TUpdateMenuApiParams = {
  id: string;
  foodsByDate: TObject;
  menuType: EMenuTypes;
  mealType: EMenuMealType;
  startDate: number;
  daysOfWeek: EDayOfWeek[];
  restaurantId: string;
  title: string;
  numberOfCycles: number;
  endDate: number;
};

export type TDuplicateMenuApiParams = {
  id: string;
  foodsByDate: TObject;
  menuType: EMenuTypes;
  mealType: EMenuMealType;
  startDate: number;
  daysOfWeek: EDayOfWeek[];
  restaurantId: string;
  title: string;
  numberOfCycles: number;
  endDate: number;
};
