import {
  EBookerOrderDraftStates,
  EOrderDraftStates,
  EOrderStates,
} from './enums';

export const ORDER_STATE_TRANSIT_FLOW = {
  [EOrderDraftStates.draft]: [
    EOrderDraftStates.pendingApproval,
    EOrderStates.canceled,
  ],
  [EBookerOrderDraftStates.bookerDraft]: [EOrderStates.canceled],
  [EOrderDraftStates.pendingApproval]: [
    EOrderStates.picking,
    EOrderStates.canceledByBooker,
    EOrderStates.canceled,
  ],
  [EOrderStates.picking]: [EOrderStates.inProgress, EOrderStates.canceled],
  [EOrderStates.inProgress]: [EOrderStates.pendingPayment],
  [EOrderStates.pendingPayment]: [EOrderStates.completed],
  [EOrderStates.completed]: [EOrderStates.reviewed],
};

export const ORDER_STATES_TO_ENABLE_EDIT_ABILITY = [
  EOrderDraftStates.pendingApproval,
  EOrderStates.picking,
  EOrderStates.inProgress,
];

export const FORMATTED_WEEKDAY = {
  1: 'Thứ hai',
  2: 'Thứ ba',
  3: 'Thứ tư',
  4: 'Thứ năm',
  5: 'Thứ sáu',
  6: 'Thứ bảy',
  7: 'Chủ nhật',
};

export const DAY_IN_WEEK = [
  { key: 'mon', label: 'DayInWeekField.mon' },
  { key: 'tue', label: 'DayInWeekField.tue' },
  { key: 'wed', label: 'DayInWeekField.wed' },
  { key: 'thu', label: 'DayInWeekField.thu' },
  { key: 'fri', label: 'DayInWeekField.fri' },
  { key: 'sat', label: 'DayInWeekField.sat' },
  { key: 'sun', label: 'DayInWeekField.sun' },
];

export const LOCAL_STORAGE_KEYS = {
  TEMP_COMPANY_ID: 'temp-company-id',
};

export const QUERY_REFS = {
  INVITATION_LINK: 'invitation-link' as const,
};

export const PICKING_ONLY_ONE_FOOD_NAMES = (() => {
  const envValue = process.env.NEXT_PUBLIC_PICKING_ONLY_ONE_FOOD_NAMES;
  if (!envValue) return [];

  try {
    const parsed = JSON.parse(envValue);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    return [];
  }

  return [];
})();
