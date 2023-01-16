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
      restaurant: string; // restaurant listing id
      memberOrders: {
        [participant: string]: string; // food id
      };
    };
  };
};
