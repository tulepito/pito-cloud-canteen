import type { ECompanyPermission } from '@src/utils/enums';

import type { Assert, DeepPartial, Image, ListingBuilder } from './utils';

export type FoodListing = ListingBuilder<
  {},
  {
    allergicIngredients: string[];
    category: string;
    foodType: string;
    maxQuantity: number;
    menuIdList: string[];
    menuType: string;
    menuWeekDay: string[];
    minOrderHourInAdvance: number;
    minQuantity: number;
    numberOfMainDishes: string;
    packaging: string;
    sideDishes: string[];
    unit: string;
  },
  {
    adminApproval: string;
    isDraft: boolean;
    isFoodEnable: boolean;
    listingType: string;
    restaurantId: string;
  },
  {},
  { images: Image[] }
>;

export type OrderListing = ListingBuilder<
  {},
  {
    companyName: string;
    orderName: string;
  },
  {
    bookerId: string;
    companyId: string;
    companyName: string;
    dayInWeek: string[];
    daySession: string;
    deadlineDate: number;
    deadlineHour: string;
    deliveryAddress: {
      address: string;
      origin: {
        lat: number;
        lng: number;
      };
    };
    deliveryHour: string;
    endDate: number;
    isAutoPickFood: boolean;
    listingType: string;
    mealType: string[];
    memberAmount: number;
    menuIds: string[];
    nutritions: string[];
    orderState: string;
    orderStateHistory: { state: string; updatedAt: number }[];
    orderType: string;
    packagePerMember: number;
    participants: string[];
    plans: string[];
    selectedGroups: string[];
    serviceFees: Record<string, number>;
    startDate: number;
    ratings: RatingListingMetadata[];
  },
  {},
  {}
>;

export type MemberOrderValue = {
  foodId: string;
  requirement: string;
  status: 'empty' | 'joined' | 'notJoined' | 'notAllowed' | 'expired';
  barcode?: string;
};

export type OrderDetailValue = {
  hasNoRestaurants: boolean;
  lineItems: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    unitPrice: number;
  }[];
  transactionId: string;
  lastTransition: string;
  trackingLink?: string;
  memberOrders: Record<string, MemberOrderValue>;
  restaurant: {
    foodList: Record<
      string,
      {
        foodName: string;
        foodPrice: number;
        foodUnit: string;
      }
    >;
    id: string;
    maxQuantity: number;
    menuId: string;
    minQuantity: number;
    phoneNumber: string;
    restaurantName: string;
  };
  editTagVersion?: number;
  oldValues?: OrderDetailValue[];
};

export type PlanListing = ListingBuilder<
  {},
  {},
  {
    listingType: string;
    menuIds: string[];
    orderDetail: { [timestamp: string]: OrderDetailValue };
    deliveryAgentsMeals: {
      [timestamp: string]: {
        restaurantId: string;
        restaurantName: string;
        numberOfMeals: number;
      };
    };
    orderDetailStartedSnapshot: { [timestamp: string]: OrderDetailValue };
    barcodeHashMap: Record<string, string>;
    orderId: string;
    partnerIds: string[];
    planStarted: boolean;
    slackThreadTs: string;
    allowToScan?: boolean;
    deliveryInfoLastUpdatedAtTimestamp?: number;
    deliveryInfo?: Record<
      string,
      Record<
        string,
        {
          images: {
            imageUrl: string;
            imageId: string;
          }[];
        }
      >
    >;
  },
  {},
  {}
>;

export type UserListing = DeepPartial<{
  id: {
    _sdkType: string;
    uuid: string;
  };
  type: string;
  attributes: {
    deleted: boolean;
    banned: boolean;
    email: string;
    createdAt: string;
    state: string;
    identityProviders: unknown[];
    pendingEmail: unknown;
    emailVerified: boolean;
    profile: {
      displayName: string;
      firstName: string;
      privateData: {
        hasOrderBefore: boolean;
        oneSignalUserIds: string[];
        quizData: {
          daySession: string;
          deliveryHour: string;
          mealStyles: unknown[];
          mealType: unknown[];
          memberAmount: number;
          nutritions: unknown[];
          packagePerMember: number;
        };
        subAccountId: string;
        tax: string;
      };
      protectedData: {};
      bio: unknown;
      abbreviatedName: string;
      lastName: string;
      publicData: {
        companyEmail: string;
        companyLocation: {
          address: string;
          origin: {
            lat: number;
            lng: number;
          };
        };
        companyName: string;
        isAutoPickFood: boolean;
        location: {
          address: string;
          origin: {
            lat: number;
            lng: number;
          };
        };
        phoneNumber: string;
      };
      metadata: {
        company: {
          [key: string]: {
            permission: ECompanyPermission;
          };
        };
        isPartner: boolean;
        companyList: string[];
        groups: {
          id: string;
          members: {
            email: string;
            id: string;
          }[];
          name: string;
        }[];
        hasSpecificPCCFee: boolean;
        id: string;
        isCompany: boolean;
        isAdmin: boolean;
        isOnBoardingEmailSent: boolean;
        members: {
          [key: string]: {
            email: string;
            groups: string[];
            id: string;
            inviteStatus: 'accepted' | 'declined';
            permission: 'booker' | 'participant' | 'owner';
          };
        };
        previousKeywords: string[];
        userState: string;
        walkthroughEnable: boolean;
      };
    };
  };
  profileImage: Image;
}>;

export type FlexDSKMeta = {
  page: number;
  perPage: number;
  paginationUnsupported?: boolean;
  totalItems: number;
  totalPages: number;
};

export type WithFlexSDKData<T> = {
  status: number;
  statusText: string;
  data: {
    data: T;
    meta?: FlexDSKMeta;
    included?: Image[];
  };
};

export type OrderDetail = Assert<
  Assert<Assert<PlanListing['attributes']>['metadata']>['orderDetail']
>;

export interface RatingListingMetadata {
  detailRating: {
    food: {
      rating: number;
    };
    packaging: {
      rating: number;
    };
  };
  detailTextRating: string;
  foodId: string;
  foodName: string;
  generalRating: number;
  companyId: string;
  orderId: string;
  orderCode: string;
  restaurantId: string;
  reviewRole: 'participant' | 'booker';
  reviewerId: string;
  timestamp: number;
}

export type RatingListing = ListingBuilder<
  {},
  {},
  RatingListingMetadata,
  {},
  {
    images?: Image[];
  }
>;

export type ParticipantSubOrderDocument = DeepPartial<{
  deliveryHour: string;
  txStatus: 'delivered';
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  restaurantName: string;
  status: 'joined';
  orderId: string;
  restaurantAvatarImage: Image;
  restaurantId: string;
  planId: string;
  reviewId: string;
  foodId: string;
  participantId: string;
  id: string;
}>;
