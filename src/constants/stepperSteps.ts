import type { StepperItem } from '@components/Stepper/Stepper';
import { EOrderType } from '@src/utils/enums';

export const BOOKER_CREATE_GROUP_ORDER_STEPS: StepperItem[] = [
  { label: 'Thiết lập menu' },
  { label: 'Mời thành viên' },
  { label: 'Quản lý chọn món' },
  { label: 'Hoàn tất' },
];

const BOOKER_CREATE_NORMAL_ORDER_STEPS: StepperItem[] = [
  { label: 'Khởi tạo' },
  { label: 'Tạo thực đơn' },
  { label: 'Xác nhận' },
];

export const getStepsByOrderType = (orderType: EOrderType): StepperItem[] => {
  switch (orderType) {
    case EOrderType.group:
      return BOOKER_CREATE_GROUP_ORDER_STEPS;
    case EOrderType.normal:
      return BOOKER_CREATE_NORMAL_ORDER_STEPS;
    default:
      return [];
  }
};
