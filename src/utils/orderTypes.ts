import type { EParticipantOrderStatus } from './enums';

export type TOrder = {
  orderId: string;
  adminFollowerId: string; // admin/collaborator id
  companyId: string; // company account id
  generalInfo: {
    deliveryAddress: string;
    startDate: Date;
    endDate: Date;
    deliveryHour: string;
    period: number;
    selectedGroups: any[];
    packagePerMember: number;
  };
  plans: string[]; // transaction id
};

export type TPlan = {
  meal: string;
  orderDetail: {
    [date: string]: {
      transactionId?: string;
      restaurant: {
        id: string; // restaurant listing id
        restaurantName: string;
        foodList: {
          [foodId: string]: {
            foodName: string;
            foodPrice: number;
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
    };
  };
};
