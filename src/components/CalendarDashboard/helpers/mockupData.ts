import type { Event } from 'react-big-calendar';
import { DateTime } from 'luxon';

export const EVENTS_MOCKUP: Event[] = [
  {
    resource: {
      id: '1',
      daySession: 'MORNING_SESSION',
      status: 'empty',
      type: 'dailyMeal',
      restaurantAddress:
        'East-West Highway, 264, Đ. Mai Chí Thọ, An Phú, Thành Phố Thủ Đức, Thành phố Hồ Chí Minh 800000, Việt Nam',
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
    start: DateTime.now().startOf('week').toJSDate(),
    end: DateTime.now().startOf('week').toJSDate(),
  },
  {
    resource: {
      id: '2',
      daySession: 'MORNING_SESSION',
      status: 'joined',
      type: 'dailyMeal',
      foodName: 'Gà nướng',
      restaurantAddress:
        'East-West Highway, 264, Đ. Mai Chí Thọ, An Phú, Thành Phố Thủ Đức, Thành phố Hồ Chí Minh 800000, Việt Nam',
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
    start: DateTime.now().startOf('week').plus({ days: 1 }).toJSDate(),
    end: DateTime.now().startOf('week').plus({ days: 1 }).toJSDate(),
  },

  {
    resource: {
      id: '3',
      daySession: 'EVENING_SESSION',
      status: 'empty',
      type: 'dailyMeal',
      restaurantAddress:
        'East-West Highway, 264, Đ. Mai Chí Thọ, An Phú, Thành Phố Thủ Đức, Thành phố Hồ Chí Minh 800000, Việt Nam',
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
    start: DateTime.now().startOf('week').plus({ days: 2 }).toJSDate(),
    end: DateTime.now().startOf('week').plus({ days: 2 }).toJSDate(),
  },

  {
    resource: {
      id: '4',
      daySession: 'AFTERNOON_SESSION',
      status: 'empty',
      type: 'dailyMeal',
      restaurantAddress:
        'East-West Highway, 264, Đ. Mai Chí Thọ, An Phú, Thành Phố Thủ Đức, Thành phố Hồ Chí Minh 800000, Việt Nam',
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
    start: DateTime.now().startOf('week').plus({ days: 3 }).toJSDate(),
    end: DateTime.now().startOf('week').plus({ days: 3 }).toJSDate(),
  },

  {
    resource: {
      id: '5',
      daySession: 'AFTERNOON_SESSION',
      status: 'joined',
      type: 'dailyMeal',
      foodName: 'Bún bò',
      restaurantAddress:
        'East-West Highway, 264, Đ. Mai Chí Thọ, An Phú, Thành Phố Thủ Đức, Thành phố Hồ Chí Minh 800000, Việt Nam',
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
    start: DateTime.now().startOf('week').plus({ days: 4 }).toJSDate(),
    end: DateTime.now().startOf('week').plus({ days: 4 }).toJSDate(),
  },
  {
    resource: {
      id: '6',
      daySession: 'MORNING_SESSION',
      status: 'empty',
      type: 'dailyMeal',
      restaurantAddress:
        'East-West Highway, 264, Đ. Mai Chí Thọ, An Phú, Thành Phố Thủ Đức, Thành phố Hồ Chí Minh 800000, Việt Nam',
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
    start: DateTime.now().startOf('week').plus({ days: 5 }).toJSDate(),
    end: DateTime.now().startOf('week').plus({ days: 5 }).toJSDate(),
  },
  {
    resource: {
      id: '7',
      daySession: 'MORNING_SESSION',
      status: 'empty',
      type: 'dailyMeal',
      restaurantAddress:
        'East-West Highway, 264, Đ. Mai Chí Thọ, An Phú, Thành Phố Thủ Đức, Thành phố Hồ Chí Minh 800000, Việt Nam',
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
    start: DateTime.now().startOf('week').plus({ days: 6 }).toJSDate(),
    end: DateTime.now().startOf('week').plus({ days: 6 }).toJSDate(),
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

export const getBookerMockupSubOrder = (startDate: Date) => {
  return {
    resource: {
      id: Number(startDate),
      daySession: 'MORNING_SESSION',
      isSelectedFood: true,
      restaurant: {
        id: '1',
        name: 'Vua hải sản',
        menuId: '1',
        coverImage: undefined,
      },
      meal: {
        dishes: [
          {
            key: '1',
            name: 'Tôm hùm Alaska',
          },
          {
            key: '2',
            name: 'Bạch tuột Caribe',
          },
          {
            key: '3',
            name: 'Gỏi hải sản thập cẩm',
          },
        ],
      },
      planId: '1',
    },
    start: DateTime.fromMillis(Number(startDate)).startOf('day').toJSDate(),
    end: DateTime.fromMillis(Number(startDate)).endOf('day').toJSDate(),
  };
};
