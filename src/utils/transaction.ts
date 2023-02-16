import configs from '@src/configs';

export enum ETransactionActor {
  CUSTOMER = 'customer',
  PROVIDER = 'provider',
  SYSTEM = 'system',
  OPERATOR = 'operator',
}

export enum ETransition {
  INITIATE_TRANSACTION = 'transition/initiate-transaction',
  EXPIRED_DELIVERY = 'transition/expired-delivery',
  START_DELIVERY = 'transition/start-delivery',
  OPERATOR_CANCEL_PLAN = 'transition/operator-cancel-plan',
  CANCEL_DELIVERY = 'transition/cancel-delivery',
  COMPLETE_DELIVERY = 'transition/complete-delivery',
  REVIEW_RESTAURANT = 'transition/restaurant-review',
  REVIEW_RESTAURANT_AFTER_EXPIRE_TIME = 'transition/restaurant-review-after-expire-time',
  EXPIRED_REVIEW_TIME = 'transition/expired-review-time',
}

export enum ETransactionState {
  INITIAL = 'initial',
  INITIATED = 'initiated',
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
    [ETransactionState.INITIATED]: {
      on: {
        [ETransition.INITIATE_TRANSACTION]: ETransactionState.INITIAL,
      },
    },
    [ETransactionState.CANCELED]: {
      on: {
        [ETransition.OPERATOR_CANCEL_PLAN]: ETransactionState.INITIATED,
      },
    },
    [ETransactionState.DELIVERING]: {
      on: {
        [ETransition.START_DELIVERY]: ETransactionState.INITIATED,
      },
    },
    [ETransactionState.FAILED_DELIVERY]: {
      on: {
        [ETransition.EXPIRED_DELIVERY]: ETransactionState.INITIATED,
        [ETransition.CANCEL_DELIVERY]: ETransactionState.DELIVERING,
      },
    },
    [ETransactionState.COMPLETED]: {
      on: {
        [ETransition.COMPLETE_DELIVERY]: ETransactionState.DELIVERING,
      },
    },
    [ETransactionState.REVIEWED]: {
      on: {
        [ETransition.REVIEW_RESTAURANT]: ETransactionState.COMPLETED,
        [ETransition.REVIEW_RESTAURANT_AFTER_EXPIRE_TIME]:
          ETransactionState.EXPIRED_REVIEW,
      },
    },
    [ETransactionState.EXPIRED_REVIEW]: {
      on: {
        [ETransition.EXPIRED_REVIEW_TIME]: ETransactionState.COMPLETED,
      },
    },
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
      ? Object.keys(stateTransitions)
      : [];

    return [
      ...transitionArray,
      ...transitionKeys.map(
        (key) =>
          ({ key, value: stateTransitions[key] } as {
            key: ETransition;
            value: ETransactionState;
          }),
      ),
    ];
  };

  return stateNames.reduce(transitionsReducer, []);
};

// This is a list of all the transitions that this app should be able to handle.
export const TRANSITIONS = getTransitions(
  statesFromStateDescription(stateDescription),
).map((t) => t.key);

// This function returns a function that has given stateDesc in scope chain.
const getTransitionsToStateFn =
  (stateDesc: TStateDescription) => (state: ETransactionState) =>
    getTransitions(statesFromStateDescription(stateDesc))
      .filter((t) => t.value === state)
      .map((t) => t.key);

// Get all the transitions that lead to specified state.
export const getTransitionsToState = getTransitionsToStateFn(stateDescription);
