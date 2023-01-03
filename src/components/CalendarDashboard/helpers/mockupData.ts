export const EVENTS_MOCKUP = [
  {
    resource: {
      id: '1',
      daySession: 'MORNING_SESSION',
      status: 'notJoined',
      type: 'dailyMeal',
      deliveryAddress: {
        address:
          'East-West Highway, 264, Đ. Mai Chí Thọ, An Phú, Thành Phố Thủ Đức, Thành phố Hồ Chí Minh 800000, Việt Nam',
        origin: {
          lat: 10.7899885,
          lng: 106.7505416,
        },
      },
      restaurant: {
        id: '12',
        name: 'Vua Hải Sản',
      },
      expiredTime: new Date(2022, 11, 29, 16, 0, 0),
      meal: {
        dishes: [
          { key: 'mon_an_1', value: 'Mon an 1' },
          { key: 'mon_an_2', value: 'Mon an 2' },
          { key: 'mon_an_3', value: 'Mon an 3' },
        ],
      },
    },
    title: 'PT3040',
    start: new Date(2022, 11, 29, 16, 0, 0),
    end: new Date(2022, 11, 29, 20, 0, 0),
  },
  {
    resource: {
      id: '2',
      daySession: 'MORNING_SESSION',
      status: 'joined',
      type: 'dailyMeal',
      deliveryAddress: {},
      restaurant: {
        id: '12',
        name: 'Vua Hải Sản',
      },
      expiredTime: new Date(2022, 11, 29, 16, 0, 0),
      meal: {
        dishes: [
          { key: 'mon_an_1', value: 'Mon an 1' },
          { key: 'mon_an_2', value: 'Mon an 2' },
          { key: 'mon_an_3', value: 'Mon an 3' },
        ],
      },
    },
    title: 'PT3041',
    start: new Date(2022, 11, 29, 16, 0, 0),
    end: new Date(2022, 11, 29, 20, 0, 0),
  },

  {
    resource: {
      id: '3',
      daySession: 'EVENING_SESSION',
      status: 'empty',
      type: 'dailyMeal',
      deliveryAddress: {
        address:
          'East-West Highway, 264, Đ. Mai Chí Thọ, An Phú, Thành Phố Thủ Đức, Thành phố Hồ Chí Minh 800000, Việt Nam',
        origin: {
          lat: 10.7899885,
          lng: 106.7505416,
        },
      },
      restaurant: {
        id: '12',
        name: 'Vua Hải Sản',
      },
      expiredTime: new Date(2022, 11, 30, 16, 0, 0),
      meal: {
        dishes: [
          { key: 'mon_an_1', value: 'Mon an 1' },
          { key: 'mon_an_2', value: 'Mon an 2' },
          { key: 'mon_an_3', value: 'Mon an 3' },
        ],
      },
    },
    title: 'PT30402',
    start: new Date(2022, 11, 30, 16, 0, 0),
    end: new Date(2022, 11, 30, 20, 0, 0),
  },

  {
    resource: {
      id: '4',
      daySession: 'AFTERNOON_SESSION',
      status: 'empty',
      type: 'dailyMeal',
      deliveryAddress: {
        address:
          'East-West Highway, 264, Đ. Mai Chí Thọ, An Phú, Thành Phố Thủ Đức, Thành phố Hồ Chí Minh 800000, Việt Nam',
        origin: {
          lat: 10.7899885,
          lng: 106.7505416,
        },
      },
      restaurant: {
        id: '12',
        name: 'Vua Hải Sản',
      },
      expiredTime: new Date(2022, 11, 30, 16, 0, 0),
      meal: {
        dishes: [
          { key: 'mon_an_1', value: 'Mon an 1' },
          { key: 'mon_an_2', value: 'Mon an 2' },
          { key: 'mon_an_3', value: 'Mon an 3' },
        ],
      },
    },
    title: 'PT3043',
    start: new Date(2022, 11, 30, 16, 0, 0),
    end: new Date(2022, 11, 30, 20, 0, 0),
  },

  {
    resource: {
      id: '5',
      daySession: 'AFTERNOON_SESSION',
      status: 'joined',
      type: 'dailyMeal',
      deliveryAddress: {
        address:
          'East-West Highway, 264, Đ. Mai Chí Thọ, An Phú, Thành Phố Thủ Đức, Thành phố Hồ Chí Minh 800000, Việt Nam',
        origin: {
          lat: 10.7899885,
          lng: 106.7505416,
        },
      },
      restaurant: {
        id: '12',
        name: 'Vua Hải Sản',
      },
      expiredTime: new Date(2022, 11, 30, 16, 0, 0),
      meal: {
        dishes: [
          { key: 'mon_an_1', value: 'Mon an 1' },
          { key: 'mon_an_2', value: 'Mon an 2' },
          { key: 'mon_an_3', value: 'Mon an 3' },
        ],
      },
    },
    title: 'PT3044',
    start: new Date(2022, 11, 30, 16, 0, 0),
    end: new Date(2022, 11, 30, 20, 0, 0),
  },
  {
    resource: {
      id: '6',
      daySession: 'MORNING_SESSION',
      status: 'empty',
      type: 'dailyMeal',
      deliveryAddress: {
        address:
          'East-West Highway, 264, Đ. Mai Chí Thọ, An Phú, Thành Phố Thủ Đức, Thành phố Hồ Chí Minh 800000, Việt Nam',
        origin: {
          lat: 10.7899885,
          lng: 106.7505416,
        },
      },
      restaurant: {
        id: '12',
        name: 'Vua Hải Sản',
      },
      expiredTime: new Date(2022, 11, 29, 16, 0, 0),
      meal: {
        dishes: [
          { key: 'mon_an_1', value: 'Mon an 1' },
          { key: 'mon_an_2', value: 'Mon an 2' },
          { key: 'mon_an_3', value: 'Mon an 3' },
        ],
      },
    },
    title: 'PT3045',
    start: new Date(2022, 11, 29, 16, 0, 0),
    end: new Date(2022, 11, 29, 20, 0, 0),
    desc: 'Big conference for important people',
  },
  {
    resource: {
      id: '7',
      daySession: 'MORNING_SESSION',
      status: 'empty',
      type: 'dailyMeal',
      deliveryAddress: {
        address:
          'East-West Highway, 264, Đ. Mai Chí Thọ, An Phú, Thành Phố Thủ Đức, Thành phố Hồ Chí Minh 800000, Việt Nam',
        origin: {
          lat: 10.7899885,
          lng: 106.7505416,
        },
      },
      restaurant: {
        id: '12',
        name: 'Vua Hải Sản',
      },
      expiredTime: new Date(2022, 11, 27, 16, 0, 0),
      meal: {
        dishes: [
          { key: 'mon_an_1', value: 'Mon an 1' },
          { key: 'mon_an_2', value: 'Mon an 2' },
          { key: 'mon_an_3', value: 'Mon an 3' },
        ],
      },
    },
    title: 'PT3046',
    start: new Date(2022, 11, 27, 16, 0, 0),
    end: new Date(2022, 11, 27, 20, 0, 0),
    desc: 'Pre-meeting meeting, to prepare for the meeting',
  },
  {
    resource: {
      id: '8',
      daySession: 'MORNING_SESSION',
      status: 'empty',
      type: 'dailyMeal',
      deliveryAddress: {
        address:
          'East-West Highway, 264, Đ. Mai Chí Thọ, An Phú, Thành Phố Thủ Đức, Thành phố Hồ Chí Minh 800000, Việt Nam',
        origin: {
          lat: 10.7899885,
          lng: 106.7505416,
        },
      },
      restaurant: {
        id: '12',
        name: 'Vua Hải Sản',
      },
      expiredTime: new Date(2022, 11, 27, 16, 0, 0),
      meal: {
        dishes: [
          { key: 'mon_an_1', value: 'Mon an 1' },
          { key: 'mon_an_2', value: 'Mon an 2' },
          { key: 'mon_an_3', value: 'Mon an 3' },
        ],
      },
    },
    title: 'PT3039',
    start: new Date(2022, 11, 27, 16, 0, 0),
    end: new Date(2022, 11, 27, 20, 0, 0),
    desc: 'Power lunch',
  },
  {
    resource: {
      id: '9',
      daySession: 'MORNING_SESSION',
      status: 'empty',
      type: 'dailyMeal',
      deliveryAddress: {
        address:
          'East-West Highway, 264, Đ. Mai Chí Thọ, An Phú, Thành Phố Thủ Đức, Thành phố Hồ Chí Minh 800000, Việt Nam',
        origin: {
          lat: 10.7899885,
          lng: 106.7505416,
        },
      },
      restaurant: {
        id: '12',
        name: 'Vua Hải Sản',
      },
      expiredTime: new Date(2022, 11, 27, 16, 0, 0),
      meal: {
        dishes: [
          { key: 'mon_an_1', value: 'Mon an 1' },
          { key: 'mon_an_2', value: 'Mon an 2' },
          { key: 'mon_an_3', value: 'Mon an 3' },
        ],
      },
    },
    title: 'PT3047',
    start: new Date(2022, 11, 27, 16, 0, 0),
    end: new Date(2022, 11, 27, 20, 0, 0),
  },
  {
    resource: {
      id: '10',
      daySession: 'MORNING_SESSION',
      status: 'joined',
      type: 'dailyMeal',
      deliveryAddress: {
        address:
          'East-West Highway, 264, Đ. Mai Chí Thọ, An Phú, Thành Phố Thủ Đức, Thành phố Hồ Chí Minh 800000, Việt Nam',
        origin: {
          lat: 10.7899885,
          lng: 106.7505416,
        },
      },
      restaurant: {
        id: '12',
        name: 'Vua Hải Sản',
      },
      expiredTime: new Date(2022, 11, 27, 16, 0, 0),
      meal: {
        dishes: [
          { key: 'mon_an_1', value: 'Mon an 1' },
          { key: 'mon_an_2', value: 'Mon an 2' },
          { key: 'mon_an_3', value: 'Mon an 3' },
        ],
      },
    },
    title: 'PT3048',
    start: new Date(2022, 11, 27, 16, 0, 0),
    end: new Date(2022, 11, 27, 20, 0, 0),
    desc: 'Most important meal of the day',
  },
  {
    resource: {
      id: '11',
      daySession: 'MORNING_SESSION',
      status: 'empty',
      type: 'dailyMeal',
      deliveryAddress: {
        address:
          'East-West Highway, 264, Đ. Mai Chí Thọ, An Phú, Thành Phố Thủ Đức, Thành phố Hồ Chí Minh 800000, Việt Nam',
        origin: {
          lat: 10.7899885,
          lng: 106.7505416,
        },
      },
      restaurant: {
        id: '12',
        name: 'Vua Hải Sản',
      },
      expiredTime: new Date(2022, 11, 28, 16, 0, 0),
      meal: {
        dishes: [
          { key: 'mon_an_1', value: 'Mon an 1' },
          { key: 'mon_an_2', value: 'Mon an 2' },
          { key: 'mon_an_3', value: 'Mon an 3' },
        ],
      },
    },
    title: 'PT3049',
    start: new Date(2022, 11, 28, 16, 0, 0),
    end: new Date(2022, 11, 28, 20, 0, 0),
  },
  {
    resource: {
      id: '12',
      daySession: 'MORNING_SESSION',
      status: 'empty',
      type: 'dailyMeal',
      deliveryAddress: {
        address:
          'East-West Highway, 264, Đ. Mai Chí Thọ, An Phú, Thành Phố Thủ Đức, Thành phố Hồ Chí Minh 800000, Việt Nam',
        origin: {
          lat: 10.7899885,
          lng: 106.7505416,
        },
      },
      restaurant: {
        id: '12',
        name: 'Vua Hải Sản',
      },
      expiredTime: new Date(2022, 11, 28, 16, 0, 0),
      meal: {
        dishes: [
          { key: 'mon_an_1', value: 'Mon an 1' },
          { key: 'mon_an_2', value: 'Mon an 2' },
          { key: 'mon_an_3', value: 'Mon an 3' },
        ],
      },
    },
    title: 'PT3050',
    start: new Date(2023, 11, 28, 7, 0, 0),
    end: new Date(2023, 11, 28, 10, 30, 0),
  },
  {
    resource: {
      id: '13',
      daySession: 'MORNING_SESSION',
      status: 'empty',
      type: 'dailyMeal',
      deliveryAddress: {
        address:
          'East-West Highway, 264, Đ. Mai Chí Thọ, An Phú, Thành Phố Thủ Đức, Thành phố Hồ Chí Minh 800000, Việt Nam',
        origin: {
          lat: 10.7899885,
          lng: 106.7505416,
        },
      },
      restaurant: {
        id: '12',
        name: 'Vua Hải Sản',
      },
      expiredTime: new Date(2022, 11, 28, 16, 0, 0),
      meal: {
        dishes: [
          { key: 'mon_an_1', value: 'Mon an 1' },
          { key: 'mon_an_2', value: 'Mon an 2' },
          { key: 'mon_an_3', value: 'Mon an 3' },
        ],
      },
    },
    title: 'PT3051',
    start: new Date(2023, 11, 28, 7, 0, 0),
    end: new Date(2023, 11, 28, 10, 30, 0),
  },
  {
    resource: {
      id: '14',
      daySession: 'MORNING_SESSION',
      status: 'empty',
      type: 'dailyMeal',
      deliveryAddress: {
        address:
          'East-West Highway, 264, Đ. Mai Chí Thọ, An Phú, Thành Phố Thủ Đức, Thành phố Hồ Chí Minh 800000, Việt Nam',
        origin: {
          lat: 10.7899885,
          lng: 106.7505416,
        },
      },
      restaurant: {
        id: '12',
        name: 'Vua Hải Sản',
      },
      expiredTime: new Date(2022, 11, 29, 7, 0, 0),
      meal: {
        dishes: [
          { key: 'mon_an_1', value: 'Mon an 1' },
          { key: 'mon_an_2', value: 'Mon an 2' },
          { key: 'mon_an_3', value: 'Mon an 3' },
        ],
      },
    },
    title: 'PT3052',
    start: new Date(2022, 11, 29, 7, 0, 0),
    end: new Date(2023, 11, 29, 10, 30, 0),
  },
  {
    resource: {
      id: '15',
      daySession: 'MORNING_SESSION',
      status: 'empty',
      type: 'dailyMeal',
      deliveryAddress: {
        address:
          'East-West Highway, 264, Đ. Mai Chí Thọ, An Phú, Thành Phố Thủ Đức, Thành phố Hồ Chí Minh 800000, Việt Nam',
        origin: {
          lat: 10.7899885,
          lng: 106.7505416,
        },
      },
      restaurant: {
        id: '12',
        name: 'Vua Hải Sản',
      },
      expiredTime: new Date(2022, 11, 29, 7, 0, 0),
      meal: {
        dishes: [
          { key: 'mon_an_1', value: 'Mon an 1' },
          { key: 'mon_an_2', value: 'Mon an 2' },
          { key: 'mon_an_3', value: 'Mon an 3' },
        ],
      },
    },
    title: 'PT3053',
    start: new Date(2022, 11, 29, 7, 0, 0),
    end: new Date(2023, 11, 29, 12, 0, 0),
  },
  {
    resource: {
      id: '16',
      daySession: 'AFTERNOON_SESSION',
      status: 'empty',
      type: 'dailyMeal',
      deliveryAddress: {
        address:
          'East-West Highway, 264, Đ. Mai Chí Thọ, An Phú, Thành Phố Thủ Đức, Thành phố Hồ Chí Minh 800000, Việt Nam',
        origin: {
          lat: 10.7899885,
          lng: 106.7505416,
        },
      },
      restaurant: {
        id: '12',
        name: 'Vua Hải Sản',
      },
      expiredTime: new Date(2022, 11, 30, 7, 0, 0),
      meal: {
        dishes: [
          { key: 'mon_an_1', value: 'Mon an 1' },
          { key: 'mon_an_2', value: 'Mon an 2' },
          { key: 'mon_an_3', value: 'Mon an 3' },
        ],
      },
    },
    title: 'PT3054',
    start: new Date(2022, 11, 30, 7, 0, 0),
    end: new Date(2023, 11, 30, 2, 0, 0),
  },
];

export const MEAL_PLANS_MOCKUP = [
  {
    resource: {
      id: '1',
      daySession: 'MORNING_SESSION',
      suitableAmount: 10,
      status: 'notJoined',
      type: 'dailyMeal',
      deliveryAddress: {
        address:
          'East-West Highway, 264, Đ. Mai Chí Thọ, An Phú, Thành Phố Thủ Đức, Thành phố Hồ Chí Minh 800000, Việt Nam',
        origin: {
          lat: 10.7899885,
          lng: 106.7505416,
        },
      },
      restaurant: {
        id: '12',
        name: 'Vua Hải Sản',
      },
      expiredTime: new Date(2022, 11, 29, 16, 0, 0),
      meal: {
        dishes: [
          { key: 'mon_an_1', value: 'Mon an 1' },
          { key: 'mon_an_2', value: 'Mon an 2' },
          { key: 'mon_an_3', value: 'Mon an 3' },
        ],
      },
    },
    title: 'PT3040',
    start: new Date(2022, 11, 29, 16, 0, 0),
    end: new Date(2022, 11, 29, 20, 0, 0),
  },
];
