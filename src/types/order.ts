import type { EParticipantOrderStatus } from '@src/utils/enums';

export type TLineItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unitPrice: number;
};

export type TCartItem = {
  status?: EParticipantOrderStatus;
  foodId: string;
  requirement: string;
  secondaryFoodId?: string;
  secondaryRequirement?: string;
};

export type TMemberOrders = {
  [participantId: string]: TCartItem;
};

export type TPlanOrder = {
  [dayId: string]: {
    memberOrders: TMemberOrders;
  };
};

export type TUpdateParticipantOrderApiBody = {
  orderId: string;
  orderDays: string[];
  planId: string;
  planData: TPlanOrder;
};

export type TFood = {
  foodName: string;
  foodPrice: number;
  foodUnit: string;
};

export type TOrderDetailRestaurant = {
  id: string;
  menuId: string;
  minQuantity: number;
  maxQuantity: number;
  restaurantName: string;
  foodList: {
    [foodId: string]: TFood;
  };
};

export type TOrderDetail = {
  [dayId: string]: {
    hasNoRestaurants: boolean;
    lineItems?: TLineItem[];
    memberOrders: TMemberOrders;
    restaurant: TOrderDetailRestaurant;
    transactionId: string;
    lastTransition: string;
    trackingLink?: string;
  };
};
