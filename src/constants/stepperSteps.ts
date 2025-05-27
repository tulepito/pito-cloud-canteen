import { useIntl } from 'react-intl';

import type { StepperItem } from '@components/Stepper/Stepper';
import { EOrderType } from '@src/utils/enums';

export const useBookerCreateGroupOrderStepsLabel = () => {
  const intl = useIntl();
  const BOOKER_CREATE_GROUP_ORDER_STEPS: StepperItem[] = [
    { label: intl.formatMessage({ id: 'thiet-lap-menu' }) },
    { label: intl.formatMessage({ id: 'moi-thanh-vien' }) },
    { label: intl.formatMessage({ id: 'quan-ly-chon-mon' }) },
    { label: intl.formatMessage({ id: 'hoan-tat' }) },
  ];

  return BOOKER_CREATE_GROUP_ORDER_STEPS;
};

const useBookerCreateNormalOrderStepsLabel = () => {
  const intl = useIntl();
  const BOOKER_CREATE_NORMAL_ORDER_STEPS: StepperItem[] = [
    { label: intl.formatMessage({ id: 'khoi-tao' }) },
    { label: intl.formatMessage({ id: 'tao-thuc-don' }) },
    { label: intl.formatMessage({ id: 'xac-nhan' }) },
  ];

  return BOOKER_CREATE_NORMAL_ORDER_STEPS;
};

export const useStepsByOrderType = (orderType: EOrderType): StepperItem[] => {
  const BOOKER_CREATE_GROUP_ORDER_STEPS = useBookerCreateGroupOrderStepsLabel();
  const BOOKER_CREATE_NORMAL_ORDER_STEPS =
    useBookerCreateNormalOrderStepsLabel();

  switch (orderType) {
    case EOrderType.group:
      return BOOKER_CREATE_GROUP_ORDER_STEPS;
    case EOrderType.normal:
      return BOOKER_CREATE_NORMAL_ORDER_STEPS;
    default:
      return [];
  }
};
