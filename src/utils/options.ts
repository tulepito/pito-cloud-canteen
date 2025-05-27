import { useIntl } from 'react-intl';

import { EBadgeType } from '@components/Badge/Badge';
import {
  AFTERNOON_SESSION,
  DINNER_SESSION,
  EVENING_SESSION,
  MORNING_SESSION,
} from '@components/CalendarDashboard/helpers/constant';

import {
  EBookerOrderDraftStates,
  EFoodType,
  EMenuMealType,
  EMenuType,
  EOrderDraftStates,
  EOrderStates,
  ERestaurantListingStatus,
} from './enums';

export const getLabelByKey = (
  list: { key: string; label: string }[],
  key: any,
) => {
  const item = (list || []).find((l: any) => l.key === key);

  return item?.label || key;
};

export const OTHER_OPTION = 'other';
export const YES = 'yes';
export const NO = 'no';
export const REGISTERING = 'registering';

export const RESTAURANT_STATUS_OPTIONS = [
  {
    key: ERestaurantListingStatus.new,
    label: 'Mới',
  },
  {
    key: ERestaurantListingStatus.authorized,
    label: 'Đã xác thực',
  },
  {
    key: ERestaurantListingStatus.unsatisfactory,
    label: 'Không đạt yêu cầu',
  },
];

// Bank list
export const BANK_OPTIONS = [
  {
    key: 'ncb',
    label: 'Ngân hàng NCB',
  },
  {
    key: 'techcombank',
    label: 'Ngân hàng Techcombank',
  },
  {
    key: 'agribank',
    label: 'Ngân hàng Agribank',
  },
  {
    key: 'scb',
    label: 'Ngân hàng SCB',
  },
  {
    key: 'sacombank',
    label: 'Ngân hàng Sacombank',
  },
  {
    key: 'eximbank',
    label: 'Ngân hàng Eximbank',
  },
  {
    key: 'msbank',
    label: 'Ngân hàng MSBank',
  },
  {
    key: 'nam-a-bank',
    label: 'Ngân hàng NamABank',
  },
  {
    key: 'vnmart',
    label: 'Ngân hàng VNMart',
  },
  {
    key: 'vietinbank',
    label: 'Ngân hàng VietinBank',
  },
  {
    key: 'vietcombank',
    label: 'Ngân hàng VietcomBank',
  },
  {
    key: 'hdbank',
    label: 'Ngân hàng HDBank',
  },
  {
    key: 'dong-a-bank',
    label: 'Ngân hàng Đông Á',
  },
  {
    key: 'tpbank',
    label: 'Ngân hàng TPBank',
  },
  {
    key: 'oceanbank',
    label: 'Ngân hàng OceanBank',
  },
  {
    key: 'bidv',
    label: 'Ngân hàng BIDV',
  },
  {
    key: 'vpbank',
    label: 'Ngân hàng VPBank',
  },
  {
    key: 'mbbank',
    label: 'Ngân hàng MBBank',
  },
  {
    key: 'acb',
    label: 'Ngân hàng ACB',
  },
  {
    key: 'ocb',
    label: 'Ngân hàng OCB',
  },
  {
    key: 'ivb',
    label: 'Ngân hàng IVB',
  },
  {
    key: 'nasb',
    label: 'Ngân hàng TMCP Bắc Á (NASP)',
  },
  {
    key: 'anz',
    label: 'Ngân hàng ANZ (ANZ Bank)',
  },
  {
    key: 'phuong-nam-bank',
    label: 'Ngân hàng Phương Nam (Phuong Nam Bank)',
  },
  {
    key: 'vib',
    label: 'Ngân hàng TMCP Quốc Tế Việt Nam (VIB)',
  },
  {
    key: 'viet-a-bank',
    label: 'Ngân hàng Việt Á (VietABank)',
  },
  {
    key: 'petrolimex',
    label: 'Ngân hàng xăng đầu Petrolimex (PG Bank)',
  },
  {
    key: 'lien-viet-post-bank',
    label: 'Ngân hàng bưu điện Liên Việt (LienVietPostBank)',
  },
  {
    key: 'hsbc',
    label: 'Ngân hàng HSBC Việt Nam (HSBC)',
  },
  {
    key: 'mhbbank',
    label: 'Ngân hàng phát triển nhà đồng bằng sông cửu long (MHB Bank)',
  },
  {
    key: 'seabank',
    label: 'Ngân hàng Đông Nam Á (SeABank)',
  },
  {
    key: 'abbank',
    label: 'Ngân hàng TMCP An Bình (ABBank)',
  },
  {
    key: 'citibank',
    label: 'Ngân hàng Citibank Việt Nam (Citibank)',
  },
  {
    key: 'gbbank',
    label: 'Ngân hàng dầu khí toàn cầu (GBBank)',
  },
  {
    key: 'shb',
    label: 'Ngân hàng TMCP Sài Gòn - Hà Nội (SHB)',
  },
  {
    key: 'saigon-bank',
    label: 'Ngân hàng TMCP Sài Gòn công thương (SaiGonBank)',
  },
  {
    key: 'vncp',
    label: 'Ngân hàng xây dựng Việt Nam (VNCP)',
  },
  {
    key: 'kien-long-bank',
    label: 'Ngân hàng TMCP Kiên Long (Kienlongbank)',
  },
  {
    key: 'shinhanbank',
    label: 'Ngân hàng Shinhan (ShinhanBank)',
  },
  {
    key: 'bao-viet-bank',
    label: 'Ngân hàng Bảo Việt (BaovietBank)',
  },
  {
    key: 'vietbank',
    label: 'Ngân hàng Việt Nam thương tín (VietBank)',
  },
  {
    key: 'pvcombank',
    label: 'Ngân hàng TMCP Đại chúng Việt Nam (PVComBank)',
  },
  {
    key: 'viet-capital-bank',
    label: 'Ngân hàng TCMP Bản Việt (VietCapitalBank)',
  },
  {
    key: 'scvn',
    label: 'Ngân hàng Standard Chartered Bank Việt Nam (SCVN)',
  },
];

export const PACKAGING_OPTIONS = [
  {
    key: 'packaging-paper-box',
    label: 'Hộp giấy 11',
  },
  {
    key: 'packaging-plastic-box',
    label: 'Hộp nhựa',
  },
  {
    key: 'packaging-bagasse-box',
    label: 'Hộp bã mía',
  },
  {
    key: 'packaging-reusable-box',
    label: 'Hộp ăn tái sử dụng',
  },
  {
    key: 'packaging-heat-retaining-aluminum-xbox',
    label: 'Hộp nhôm giữ nhiệt',
  },
  {
    key: 'packaging-Hộp xuyên thấu',
    label: 'Hộp xuyên thấu',
  },

  {
    key: 'packaging-plastic-styrofoam',
    label: 'Nhựa xốp',
  },
  {
    key: 'packaging-degradable-plastic',
    label: 'Nhựa có thể phân hủy',
  },
  {
    key: 'packaging-Thân thiện với môi trường',
    label: 'Thân thiện với môi trường',
  },
];

export const EXTRA_SERVICE_OPTIONS = [
  {
    key: 'print-personalized-labels',
    label: 'In label cá nhân hóa',
  },
  {
    key: 'reusable-box',
    label: 'Hộp tái sử dụng',
  },
  {
    key: 'bagasse-box',
    label: 'Hộp bã mía',
  },
  {
    key: 'delivery-to-the-office',
    label: 'Giao tận văn phòng ',
  },
  {
    key: OTHER_OPTION,
    label: 'Khác',
    hasTextInput: true,
    textPlaceholder: 'Nhập dịch vụ khác',
  },
];

export const BUSINESS_TYPE_OPTIONS = [
  {
    key: 'company',
    label: 'Công ty',
  },
  {
    key: 'individualBusinessHouseholds',
    label: 'Loại hình kinh doanh cá thể',
  },
];

export const BUSINESS_LICENSE_OPTIONS = [
  {
    id: 'businessLicense.yes',
    key: YES,
    hasImage: true,
    label: 'Có',
  },
  {
    id: 'businessLicense.registering',
    key: REGISTERING,
    label: 'Đang đăng ký',
  },
  {
    id: 'businessLicense.no',
    key: NO,
    label: 'Chưa',
  },
];

export const FOOD_CERTIFICATE_OPTIONS = [
  {
    id: 'foodCertificate.yes',
    key: YES,
    hasImage: true,
    label: 'Có',
  },
  {
    id: 'foodCertificate.registering',
    key: REGISTERING,
    label: 'Đang đăng ký',
  },
  {
    id: 'foodCertificate.no',
    key: NO,
    label: 'Chưa',
  },
];

export const PARTY_INSURANCE_RADIO_OPTIONS = [
  {
    id: 'partyInsurance.yes',
    key: YES,
    hasImage: true,
    label: 'Có',
  },
  {
    id: 'partyInsurance.registering',
    key: REGISTERING,
    label: 'Đang đăng ký',
  },
  {
    id: 'partyInsurance.no',
    key: NO,
    label: 'Chưa',
  },
];

// #region //* MENU *//
export const MENU_TYPE_OPTIONS = [
  { key: EMenuType.fixedMenu, label: 'Menu cố định' },
  { key: EMenuType.cycleMenu, label: 'Menu theo chu kỳ' },
];

export const MEAL_OPTIONS = [
  {
    key: EMenuMealType.breakfast,
    label: 'Ăn sáng',
  },
  {
    key: EMenuMealType.lunch,
    label: 'Ăn trưa',
  },
  {
    key: EMenuMealType.dinner,
    label: 'Ăn tối',
  },
  {
    key: 'brunch',
    label: 'Ăn xế',
  },
  {
    key: EMenuMealType.snack,
    label: 'Ăn vặt',
  },
];

export const MEAL_OPTIONS_WITH_TIME = [
  {
    key: EMenuMealType.breakfast,
    label: 'Ăn sáng (6h30 - 10h30)',
  },
  {
    key: EMenuMealType.lunch,
    label: 'Ăn trưa (10h30 - 14h)',
  },
  {
    key: EMenuMealType.dinner,
    label: 'Ăn tối (16h30 - 22h)',
  },
  {
    key: 'brunch',
    label: 'Ăn xế',
  },
  {
    key: EMenuMealType.snack,
    label: 'Ăn vặt',
  },
];

export const MENU_MEAL_TYPE_OPTIONS = [
  {
    key: EMenuMealType.breakfast,
    label: 'Ăn sáng',
  },
  {
    key: EMenuMealType.lunch,
    label: 'Ăn trưa',
  },
  {
    key: EMenuMealType.dinner,
    label: 'Ăn tối',
  },
  {
    key: EMenuMealType.snack,
    label: 'Ăn xế',
  },
];

export const PARTNER_MENU_MEAL_TYPE_OPTIONS = [
  {
    key: EMenuMealType.breakfast,
    label: 'Bữa sáng',
  },
  {
    key: EMenuMealType.lunch,
    label: 'Bữa trưa',
  },
  {
    key: EMenuMealType.dinner,
    label: 'Bữa tối',
  },
];

// #endregion

/**
 * @deprecated
 */
export const FOOD_TYPE_OPTIONS = [
  {
    key: EFoodType.vegetarianDish,
    label: 'Món chay',
  },
  {
    key: EFoodType.savoryDish,
    label: 'Món mặn',
  },
];

export const useFoodTypeOptionsByLocale = () => {
  const intl = useIntl();

  const _FOOD_TYPE_OPTIONS = [
    {
      key: EFoodType.vegetarianDish,
      label: intl.formatMessage({ id: 'mon-chay' }),
    },
    {
      key: EFoodType.savoryDish,
      label: intl.formatMessage({ id: 'mon-man' }),
    },
  ];

  return _FOOD_TYPE_OPTIONS;
};

export const FOOD_SPECIAL_DIET_OPTIONS = [
  {
    key: 'low-carb',
    label: 'Low-carb',
    badgeType: EBadgeType.default,
  },
  {
    key: 'keto',
    label: 'Keto',
    badgeType: EBadgeType.info,
  },
  {
    key: 'mediterranean-diet',
    label: 'Mediterranean Diet',
    badgeType: EBadgeType.danger,
  },
  {
    key: 'plant-based',
    label: 'Plant-based',
    badgeType: EBadgeType.warning,
  },
  {
    key: 'halal',
    label: 'Halal',
    badgeType: EBadgeType.success,
  },
  {
    key: 'intermittent-fasting',
    label: 'Intermittent Fasting',
    badgeType: EBadgeType.danger,
  },
  {
    key: 'carnivore-diet',
    label: 'Carnivore Diet',
    badgeType: EBadgeType.default,
  },
  {
    key: 'healthy',
    label: 'Healthy',
    badgeType: EBadgeType.success,
  },
  {
    key: 'paleo-diet',
    label: 'Paleo Diet',
    badgeType: EBadgeType.info,
  },
  {
    key: 'gluten-free',
    label: 'Gluten free',
    badgeType: EBadgeType.success,
  },
  {
    key: OTHER_OPTION,
    label: 'Khác',
    badgeType: EBadgeType.success,
    hasTextInput: true,
    textPlaceholder: 'Nhập chế độ dinh dưỡng',
  },
];

/**
 * @deprecated
 */
export const FOOD_SIDE_DISH_OPTIONS = [
  {
    key: 'soup',
    label: 'Món canh',
  },
  {
    key: 'stir-fried-meal',
    label: 'Món xào',
  },
  {
    key: 'dessert',
    label: 'Món tráng miệng',
  },
  {
    key: 'drink',
    label: 'Nước uống',
  },
];

export const useFoodSideDishOptionsByLocale = () => {
  const intl = useIntl();

  const _FOOD_SIDE_DISH_OPTIONS = [
    {
      key: 'soup',
      label: intl.formatMessage({ id: 'mon-canh' }),
    },
    {
      key: 'stir-fried-meal',
      label: intl.formatMessage({ id: 'mon-xao' }),
    },
    {
      key: 'dessert',
      label: intl.formatMessage({ id: 'mon-trang-mieng' }),
    },
    {
      key: 'drink',
      label: intl.formatMessage({ id: 'nuoc-uong' }),
    },
  ];

  return _FOOD_SIDE_DISH_OPTIONS;
};

/**
 * @deprecated
 */
export const ALLERGIES_OPTIONS = [
  {
    key: 'egg',
    label: 'Trứng',
  },
  {
    key: 'shrimp',
    label: 'Tôm',
  },
  {
    key: 'seafood',
    label: 'Hải sản',
  },
  {
    key: 'msg',
    label: 'Bột ngọt',
  },
  {
    key: 'soy',
    label: 'Đậu nành',
  },
];

export const useAllergiesOptionsByLocale = () => {
  const intl = useIntl();

  const _ALLERGIES_OPTIONS = [
    {
      key: 'egg',
      label: intl.formatMessage({ id: 'trung' }),
    },
    {
      key: 'shrimp',
      label: intl.formatMessage({ id: 'tom' }),
    },
    {
      key: 'seafood',
      label: intl.formatMessage({ id: 'hai-san' }),
    },
    {
      key: 'msg',
      label: intl.formatMessage({ id: 'bot-ngot' }),
    },
    {
      key: 'soy',
      label: intl.formatMessage({ id: 'dau-nanh' }),
    },
  ];

  return _ALLERGIES_OPTIONS;
};

export const FOOD_CATEGORY_OPTIONS = [
  {
    key: 'categories-Thuần Việt',
    label: 'Thuần Việt',
    badgeType: EBadgeType.info,
  },
  {
    key: 'categories-Món Bắc',
    label: 'Món Bắc',
    badgeType: EBadgeType.default,
  },
  {
    key: 'categories-Món Trung',
    label: 'Món Trung',
    badgeType: EBadgeType.danger,
  },
  {
    key: 'categories-Món Miền Tây',
    label: 'Món Miền Tây',
    badgeType: EBadgeType.info,
  },
  {
    key: 'categories-Món Hoa',
    label: 'Hoa',
    badgeType: EBadgeType.warning,
  },
  {
    key: 'categories-Món Thái',
    label: 'Thái',
    badgeType: EBadgeType.warning,
  },
  {
    key: 'categories-Món Hàn',
    label: 'Món Hàn',
    badgeType: EBadgeType.success,
  },
  {
    key: 'categories-Món Nhật',
    label: 'Nhật Bản',
    badgeType: EBadgeType.warning,
  },
  {
    key: 'categories-indian-food',
    label: 'Ấn độ',
    badgeType: EBadgeType.success,
  },
  {
    key: 'categories-french-food',
    label: 'Pháp',
    badgeType: EBadgeType.info,
  },
  {
    key: 'categories-mediterranean-food',
    label: 'Địa Trung Hải',
    badgeType: EBadgeType.danger,
  },
  {
    key: 'categories-italian-food',
    label: 'Ý',
    badgeType: EBadgeType.default,
  },
  {
    key: 'categories-barbeque',
    label: 'BBQ',
    badgeType: EBadgeType.success,
  },
  {
    key: 'categories-sea-food',
    label: 'Hải sản',
    badgeType: EBadgeType.success,
  },
  {
    key: 'categories-international-food',
    label: 'Quốc Tế',
    badgeType: EBadgeType.success,
  },
  {
    key: 'categories-Món Âu',
    label: 'Âu',
    badgeType: EBadgeType.success,
  },
  {
    key: 'categories-Món Á',
    label: 'Á',
    badgeType: EBadgeType.success,
  },
  {
    key: 'categories-vegetarian-food',
    label: 'Chay',
    badgeType: EBadgeType.success,
  },
  {
    key: 'categories-macrobiotic-food',
    label: 'Thực dưỡng',
    badgeType: EBadgeType.success,
  },
  {
    key: 'categories-Món Halal',
    label: 'Halal',
    badgeType: EBadgeType.success,
  },
  {
    key: 'categories-keto',
    label: 'keto',
    badgeType: EBadgeType.success,
  },
  {
    key: 'categories-dessert',
    label: 'Tráng miệng',
    badgeType: EBadgeType.success,
  },
  {
    key: 'categories-snack',
    label: 'Ăn vặt',
    badgeType: EBadgeType.success,
  },
];
// #endregion

/**
 * @deprecated
 */
export const ORDER_STATE_OPTIONS = [
  {
    key: EOrderStates.inProgress,
    label: 'Đang triển khai',
  },
  {
    key: EOrderStates.picking,
    label: 'Đang chọn món',
  },
  {
    key: EOrderStates.canceled,
    label: 'Hủy',
  },
  {
    key: EOrderStates.canceledByBooker,
    label: 'Hủy',
  },
  {
    key: EOrderDraftStates.pendingApproval,
    label: 'Mới tạo',
  },
  {
    key: EOrderDraftStates.draft,
    label: 'Đơn nháp',
  },
  {
    key: EBookerOrderDraftStates.bookerDraft,
    label: 'Đơn nháp',
  },
  {
    key: EOrderStates.completed,
    label: 'Chưa đánh giá',
  },
  {
    key: EOrderStates.pendingPayment,
    label: 'Chưa thanh toán',
  },
  {
    key: EOrderStates.reviewed,
    label: 'Đã đánh giá',
  },
  {
    key: EOrderStates.expiredStart,
    label: 'Hết hiệu lực',
  },
];

export const useOrderStateOptionsByLocale = () => {
  const intl = useIntl();
  const _ORDER_STATE_OPTIONS = [
    {
      key: EOrderStates.inProgress,
      label: intl.formatMessage({ id: 'dang-trien-khai' }),
    },
    {
      key: EOrderStates.picking,
      label: intl.formatMessage({ id: 'dang-chon-mon' }),
    },
    {
      key: EOrderStates.canceled,
      label: intl.formatMessage({ id: 'huy-0' }),
    },
    {
      key: EOrderStates.canceledByBooker,
      label: intl.formatMessage({ id: 'huy-0' }),
    },
    {
      key: EOrderDraftStates.pendingApproval,
      label: intl.formatMessage({ id: 'moi-tao' }),
    },
    {
      key: EOrderDraftStates.draft,
      label: intl.formatMessage({ id: 'don-nhap' }),
    },
    {
      key: EBookerOrderDraftStates.bookerDraft,
      label: intl.formatMessage({ id: 'don-nhap' }),
    },
    {
      key: EOrderStates.completed,
      label: intl.formatMessage({ id: 'chua-danh-gia' }),
    },
    {
      key: EOrderStates.pendingPayment,
      label: intl.formatMessage({ id: 'chua-thanh-toan' }),
    },
    {
      key: EOrderStates.reviewed,
      label: intl.formatMessage({ id: 'da-danh-gia' }),
    },
    {
      key: EOrderStates.expiredStart,
      label: intl.formatMessage({ id: 'het-hieu-luc' }),
    },
  ];

  return _ORDER_STATE_OPTIONS;
};

export const COMPANY_NUTRITION_TYPE_OPTIONS = [
  {
    key: 'vegeterian',
    label: 'Ăn chay',
  },
  {
    key: 'keto',
    label: 'Keto',
  },
  {
    key: 'non-glucoten',
    label: 'Không chứa glucoten',
  },
];

export const DAY_SESSION_OPTIONS = [
  {
    key: MORNING_SESSION,
    label: 'Bữa sáng',
  },
  {
    key: AFTERNOON_SESSION,
    label: 'Bữa trưa',
  },
  {
    key: EVENING_SESSION,
    label: 'Bữa tối',
  },
];

export const INITIAL_DELIVERY_TIME_BASE_ON_DAY_SESSION = {
  [MORNING_SESSION]: '08:00-08:15',
  [AFTERNOON_SESSION]: '11:00-11:15',
  [EVENING_SESSION]: '18:00-18:15',
  [DINNER_SESSION]: '18:00-18:15',
};
