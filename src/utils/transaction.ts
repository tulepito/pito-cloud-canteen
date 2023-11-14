import configs from '@src/configs';

import { ensureTransaction } from './data';
import type { TTransaction } from './types';

export const CHANGE_STRUCTURE_TX_PROCESS_VERSION = Number(
  process.env.NEXT_PUBLIC_CHANGE_STRUCTURE_TX_PROCESS_VERSION,
);

export enum ETransactionActor {
  CUSTOMER = 'customer',
  PROVIDER = 'provider',
  SYSTEM = 'system',
  OPERATOR = 'operator',
}

export enum ETransition {
  INITIATE_TRANSACTION = 'transition/initiate-transaction',
  EXPIRED_START_DELIVERY = 'transition/expired-start-delivery',
  START_DELIVERY = 'transition/start-delivery',
  PARTNER_CONFIRM_SUB_ORDER = 'transition/partner-confirm-sub-order',
  PARTNER_REJECT_SUB_ORDER = 'transition/partner-reject-sub-order',
  EXPIRED_DELIVERY = 'transition/expired-delivery',
  OPERATOR_CANCEL_PLAN = 'transition/operator-cancel-plan',
  OPERATOR_CANCEL_AFTER_PARTNER_REJECTED = 'transition/operator-cancel-after-partner-rejected',
  OPERATOR_CANCEL_AFTER_PARTNER_CONFIRMED = 'transition/operator-cancel-after-partner-confirmed',
  CANCEL_DELIVERY = 'transition/cancel-delivery',
  COMPLETE_DELIVERY = 'transition/complete-delivery',
  REVIEW_RESTAURANT = 'transition/restaurant-review',
  REVIEW_RESTAURANT_AFTER_EXPIRE_TIME = 'transition/restaurant-review-after-expire-time',
  EXPIRED_REVIEW_TIME = 'transition/expired-review-time',
}

export enum ETransactionState {
  INITIAL = 'initial',
  INITIATED = 'initiated',
  PARTNER_CONFIRMED = 'partner-confirmed',
  PARTNER_REJECTED = 'partner-rejected',
  DELIVERING = 'delivering',
  CANCELED = 'canceled',
  FAILED_DELIVERY = 'failed-delivery',
  COMPLETED = 'completed',
  REVIEWED = 'reviewed',
  EXPIRED_REVIEW = 'expired-review',
}

type TStateDescription = {
  id: string;
  initial: ETransactionState;
  states: any;
};

const stateDescription: TStateDescription = {
  // id is defined only to support Xstate format.
  // However if you have multiple transaction processes defined,
  // it is best to keep them in sync with transaction process aliases.
  id: configs.bookingProcessAlias,

  // This 'initial' state is a starting point for new transaction
  initial: ETransactionState.INITIAL,

  // States
  states: {
    [ETransactionState.INITIAL]: {
      on: {
        [ETransition.INITIATE_TRANSACTION]: ETransactionState.INITIATED,
      },
    },
    [ETransactionState.INITIATED]: {
      on: {
        [ETransition.OPERATOR_CANCEL_PLAN]: ETransactionState.CANCELED,
        [ETransition.EXPIRED_START_DELIVERY]: ETransactionState.FAILED_DELIVERY,
        [ETransition.PARTNER_CONFIRM_SUB_ORDER]:
          ETransactionState.PARTNER_CONFIRMED,
        [ETransition.PARTNER_REJECT_SUB_ORDER]:
          ETransactionState.PARTNER_REJECTED,
      },
    },
    [ETransactionState.PARTNER_CONFIRMED]: {
      on: {
        [ETransition.START_DELIVERY]: ETransactionState.DELIVERING,
        [ETransition.OPERATOR_CANCEL_AFTER_PARTNER_CONFIRMED]:
          ETransactionState.CANCELED,
      },
    },
    [ETransactionState.PARTNER_REJECTED]: {
      on: {
        [ETransition.OPERATOR_CANCEL_AFTER_PARTNER_REJECTED]:
          ETransactionState.CANCELED,
      },
    },
    [ETransactionState.CANCELED]: {},
    [ETransactionState.FAILED_DELIVERY]: {},
    [ETransactionState.DELIVERING]: {
      on: {
        [ETransition.EXPIRED_DELIVERY]: ETransactionState.FAILED_DELIVERY,
        [ETransition.CANCEL_DELIVERY]: ETransactionState.FAILED_DELIVERY,
        [ETransition.COMPLETE_DELIVERY]: ETransactionState.COMPLETED,
      },
    },
    [ETransactionState.COMPLETED]: {
      on: {
        [ETransition.REVIEW_RESTAURANT]: ETransactionState.REVIEWED,
        [ETransition.EXPIRED_REVIEW_TIME]: ETransactionState.EXPIRED_REVIEW,
      },
    },
    [ETransactionState.EXPIRED_REVIEW]: {
      on: {
        [ETransition.REVIEW_RESTAURANT_AFTER_EXPIRE_TIME]:
          ETransactionState.REVIEWED,
      },
    },
    [ETransactionState.REVIEWED]: {},
  },
};

// Note: currently we assume that state description doesn't contain nested states.
const statesFromStateDescription = (description: TStateDescription) =>
  description.states || {};

// Get all the transitions from states object in an array
const getTransitions = (states: TStateDescription['states']) => {
  const stateNames = Object.keys(states) as ETransactionState[];

  const transitionsReducer = (
    transitionArray: { key: ETransition; value: ETransactionState }[],
    name: ETransactionState,
  ) => {
    const stateTransitions = states[name] && states[name].on;
    const transitionKeys = stateTransitions
      ? (Object.keys(stateTransitions) as ETransition[])
      : [];

    return [
      ...transitionArray,
      ...transitionKeys.map<{
        key: ETransition;
        value: ETransactionState;
      }>((key) => ({ key, value: stateTransitions[key] })),
    ];
  };

  return stateNames.reduce(transitionsReducer, []);
};

export const txLastTransition = (tx: TTransaction) =>
  ensureTransaction(tx).attributes.lastTransition;

// This is a list of all the transitions that this app should be able to handle.
export const TRANSITIONS = getTransitions(
  statesFromStateDescription(stateDescription),
).map((t) => t.key);

// This function returns a function that has given stateDesc in scope chain.
const getTransitionsToStateFn =
  (stateDesc: TStateDescription) => (state: ETransactionState) => {
    return getTransitions(statesFromStateDescription(stateDesc))
      .filter((t) => t.value === state)
      .map((t) => t.key);
  };

// Get all the transitions that lead to specified state.
export const getTransitionsToState = getTransitionsToStateFn(stateDescription);

export const txIsInitiated = (tx: TTransaction) => {
  return [ETransition.INITIATE_TRANSACTION].includes(txLastTransition(tx));
};

export const txIsCompleted = (tx: TTransaction) => {
  return [ETransition.COMPLETE_DELIVERY].includes(txLastTransition(tx));
};

export const txIsReviewed = (tx: TTransaction) => {
  return getTransitionsToState(ETransactionState.REVIEWED).includes(
    txLastTransition(tx),
  );
};

export const txIsExpiredReview = (tx: TTransaction) => {
  return [ETransition.EXPIRED_REVIEW_TIME].includes(txLastTransition(tx));
};

export const txIsPartnerConfirmed = (tx: TTransaction) => {
  return [ETransition.PARTNER_CONFIRM_SUB_ORDER].includes(txLastTransition(tx));
};

export const txIsPartnerRejected = (tx: TTransaction) => {
  return [ETransition.PARTNER_REJECT_SUB_ORDER].includes(txLastTransition(tx));
};

export const txIsDelivering = (tx: TTransaction) => {
  return [ETransition.START_DELIVERY].includes(txLastTransition(tx));
};

export const txIsDelivered = (tx: TTransaction) => {
  return [ETransition.COMPLETE_DELIVERY].includes(txLastTransition(tx));
};

export const txIsDeliveryFailed = (tx: TTransaction) => {
  return getTransitionsToState(ETransactionState.FAILED_DELIVERY).includes(
    txLastTransition(tx),
  );
};

export const txIsCanceled = (tx: TTransaction) => {
  return getTransitionsToState(ETransactionState.CANCELED).includes(
    txLastTransition(tx),
  );
};

export const TRANSITIONS_TO_STATE_CANCELED = getTransitionsToState(
  ETransactionState.CANCELED,
);
