import { EBadgeType } from '@components/Badge/Badge';

export const BadgeTypeBaseOnCategory = (key: any) => {
  switch (key) {
    case 'categories-Thuần Việt':
      return EBadgeType.info;

    case 'categories-Món Bắc':
      return EBadgeType.default;

    case 'categories-Món Trung':
      return EBadgeType.danger;

    case 'categories-Món Miền Tây':
      return EBadgeType.info;

    case 'categories-Món Hoa':
    case 'categories-Món Thái':
    case 'categories-Món Hàn':
    case 'categories-Món Nhật':
      return EBadgeType.warning;

    case 'categories-indian-food':
      return EBadgeType.success;

    case 'categories-french-food':
      return EBadgeType.info;

    case 'categories-mediterranean-food':
      return EBadgeType.danger;

    case 'categories-italian-food':
      return EBadgeType.default;

    case 'categories-barbeque':
    case 'categories-sea-food':
    case 'categories-international-food':
    case 'categories-Món Âu':
    case 'categories-Món Á':
    case 'categories-vegetarian-food':
    case 'categories-macrobiotic-food':
    case 'categories-Món Halal':
    case 'categories-keto':
    case 'categories-dessert':
    case 'categories-snack':
      return EBadgeType.success;

    default:
      return EBadgeType.default;
  }
};
