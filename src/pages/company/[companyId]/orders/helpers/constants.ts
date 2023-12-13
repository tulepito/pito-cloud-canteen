import { EBadgeType } from '@components/Badge/Badge';
import {
  EBookerOrderDraftStates,
  EOrderDraftStates,
  EOrderStates,
} from '@src/utils/enums';

export const BADGE_TYPE_BASE_ON_ORDER_STATE = {
  [EBookerOrderDraftStates.bookerDraft]: EBadgeType.caution,
  [EOrderDraftStates.pendingApproval]: EBadgeType.caution,
  [EOrderStates.canceled]: EBadgeType.default,
  [EOrderStates.canceledByBooker]: EBadgeType.default,
  [EOrderStates.picking]: EBadgeType.warning,
  [EOrderStates.inProgress]: EBadgeType.info,
  [EOrderStates.pendingPayment]: EBadgeType.danger,
  [EOrderStates.completed]: EBadgeType.success,
  [EOrderStates.reviewed]: EBadgeType.success,
  [EOrderStates.expiredStart]: EBadgeType.default,
};
