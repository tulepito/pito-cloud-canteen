import type { Image, ListingBuilder } from './utils';

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

export type PlanListing = ListingBuilder<
  {},
  {},
  {
    listingType: string;
    menuIds: string[];
    orderDetail: Record<
      string,
      {
        hasNoRestaurants: boolean;
        lineItems: unknown[];
        memberOrders: Record<
          string,
          {
            foodId: string;
            requirement: string;
            status: 'empty';
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
      }
    >;
    orderId: string;
    partnerIds: string[];
  },
  {},
  {}
>;
