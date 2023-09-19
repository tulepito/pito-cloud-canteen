import type { EParticipantOrderStatus } from './enums';
import type { ETransition } from './transaction';

export type TPlan = {
  meal: string;
  orderDetail: {
    [date: string]: {
      note?: any;
      transactionId?: string;
      lastTransition?: ETransition;
      restaurant: {
        id?: string; // restaurant listing id
        menuId?: string;
        minQuantity?: number;
        maxQuantity?: number;
        restaurantName?: string;
        foodList?: {
          [foodId: string]: {
            foodName: string;
            foodPrice: number;
            foodUnit?: string;
          };
        };
      };
      memberOrders: {
        [participant: string]: {
          foodId: string;
          status: EParticipantOrderStatus;
          requirement?: string;
        };
      };

      lineItems?: {
        id: string;
        name: string;
        quantity: number;
        price: number;
        unitPrice: number;
      }[];
    };
  };
};
