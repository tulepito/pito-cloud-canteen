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
  },
  {},
  {}
>;

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
  memberOrders: Record<
    string,
    {
      foodId: string;
      requirement: string;
      status: 'empty' | 'joined' | 'notJoined' | 'notAllowed' | 'expired';
    }
  >;
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
    orderDetailStartedSnapshot: { [timestamp: string]: OrderDetailValue };
    orderId: string;
    partnerIds: string[];
    planStarted: boolean;
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
            permission: 'booker' | 'participant' | 'owner';
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
}>;

export type WithFlexSDKData<T> = {
  status: number;
  statusText: string;
  data: {
    data: T;
  };
};

export type OrderDetail = Assert<
  Assert<Assert<PlanListing['attributes']>['metadata']>['orderDetail']
>;
