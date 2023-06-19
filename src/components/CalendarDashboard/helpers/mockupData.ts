import type { Event } from 'react-big-calendar';

export const EVENTS_MOCKUP: Event[] = [
  {
    resource: {
      id: '1',
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
      expiredTime: new Date().setDate(new Date().getDate() + 1),
      restaurant: {
        id: '12',
        name: 'Vua Hải Sản',
      },
      meal: {
        dishes: [
          { key: 'mon_an_1', value: 'Mon an 1' },
          { key: 'mon_an_2', value: 'Mon an 2' },
          { key: 'mon_an_3', value: 'Mon an 3' },
        ],
      },
      orderColor: '#65DB63',
    },
    title: 'PT3040',
    start: new Date(),
    end: new Date(),
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
      expiredTime: new Date().setDate(new Date().getDate() + 1),
      meal: {
        dishes: [
          { key: 'mon_an_1', value: 'Mon an 1' },
          { key: 'mon_an_2', value: 'Mon an 2' },
          { key: 'mon_an_3', value: 'Mon an 3' },
        ],
      },
      orderColor: '#65DB63',
    },
    title: 'PT3041',
    start: new Date(new Date().setDate(new Date().getDate() + 1)),
    end: new Date(new Date().setDate(new Date().getDate() + 1)),
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
      orderColor: '#65DB63',
    },
    title: 'PT30402',
    start: new Date(new Date().setDate(new Date().getDate() + 2)),
    end: new Date(new Date().setDate(new Date().getDate() + 2)),
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
      expiredTime: new Date().setDate(new Date().getDate() + 1),
      meal: {
        dishes: [
          { key: 'mon_an_1', value: 'Mon an 1' },
          { key: 'mon_an_2', value: 'Mon an 2' },
          { key: 'mon_an_3', value: 'Mon an 3' },
        ],
      },
      orderColor: '#65DB63',
    },
    title: 'PT3043',
    start: new Date(new Date().setDate(new Date().getDate() + 3)),
    end: new Date(new Date().setDate(new Date().getDate() + 3)),
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
      orderColor: '#65DB63',
    },
    title: 'PT3044',
    start: new Date(new Date().setDate(new Date().getDate() + 4)),
    end: new Date(new Date().setDate(new Date().getDate() + 4)),
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
      expiredTime: new Date().setDate(new Date().getDate() + 1),
      meal: {
        dishes: [
          { key: 'mon_an_1', value: 'Mon an 1' },
          { key: 'mon_an_2', value: 'Mon an 2' },
          { key: 'mon_an_3', value: 'Mon an 3' },
        ],
      },
      orderColor: '#65DB63',
    },
    title: 'PT3045',
    start: new Date(new Date().setDate(new Date().getDate() + 5)),
    end: new Date(new Date().setDate(new Date().getDate() + 5)),
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
      orderColor: '#65DB63',
    },
    title: 'PT3046',
    start: new Date(new Date().setDate(new Date().getDate() + 6)),
    end: new Date(new Date().setDate(new Date().getDate() + 6)),
  },
];

export const MEAL_PLANS_MOCKUP = [
  {
    resource: {
      id: '1',
      daySession: 'MORNING_SESSION',
      suitableAmount: 10,
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
      expiredTime: new Date(2023, 11, 29, 16, 0, 0),
      meal: {
        dishes: [
          { key: 'mon_an_1', value: 'Mon an 1' },
          { key: 'mon_an_2', value: 'Mon an 2' },
          { key: 'mon_an_3', value: 'Mon an 3' },
        ],
      },
    },
    title: 'PT3040',
    start: new Date(2023, 1, 6, 0, 0, 0),
    end: new Date(2023, 1, 6, 23, 0, 0),
  },
  {
    resource: {
      id: '1',
      daySession: 'MORNING_SESSION',
      suitableAmount: 10,
      status: 'notJoined',
      type: 'dailyMeal',
      deliveryAddress: {
        address: '133 Duong Ba Trac',
        ward: '1',
        district: '8',
        city: 'Ho Chi Minh',
        country: 'Vietnam',
      },
      restaurant: {
        id: '12',
        name: 'Vua Hải Sản',
      },
      expiredTime: new Date(2023, 11, 29, 16, 0, 0),
      meal: {
        dishes: [
          { key: 'mon_an_1', value: 'Mon an 1' },
          { key: 'mon_an_2', value: 'Mon an 2' },
          { key: 'mon_an_3', value: 'Mon an 3' },
        ],
      },
    },
    title: 'PT3040',
    start: new Date(2023, 1, 8, 16, 0, 0),
    end: new Date(2023, 1, 8, 20, 0, 0),
  },
  {
    resource: {
      id: '1',
      daySession: 'MORNING_SESSION',
      suitableAmount: 10,
      status: 'notJoined',
      type: 'dailyMeal',
      deliveryAddress: {
        address: '133 Duong Ba Trac',
        ward: '1',
        district: '8',
        city: 'Ho Chi Minh',
        country: 'Vietnam',
      },
      restaurant: {
        id: '12',
        name: 'Vua Hải Sản',
      },
      expiredTime: new Date(2023, 11, 29, 16, 0, 0),
      meal: {
        dishes: [
          { key: 'mon_an_1', value: 'Mon an 1' },
          { key: 'mon_an_2', value: 'Mon an 2' },
          { key: 'mon_an_3', value: 'Mon an 3' },
        ],
      },
    },
    title: 'PT3040',
    start: new Date(2023, 1, 7, 16, 0, 0),
    end: new Date(2023, 1, 7, 20, 0, 0),
  },
];
