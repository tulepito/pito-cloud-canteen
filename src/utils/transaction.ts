import configs from '@src/configs';

export enum ETransactionActor {
  CUSTOMER = 'customer',
  PROVIDER = 'provider',
  SYSTEM = 'system',
  OPERATOR = 'operator',
}

export enum ETransition {
  INITIATE_TRANSACTION = 'transition/initiate-transaction',
  START_DELIVERY = 'transition/start-delivery',
  OPERATOR_CANCEL_PLAN = 'transition/operator-cancel-plan',
  CANCEL_DELIVERY = 'transition/cancel-delivery',
  COMPLETE_DELIVERY = 'transition/complete-delivery',
  PARTICIPANT_REVIEW = 'transition/participant-review',
  EXPIRED_REVIEW = 'transition/expired-review',
}

export enum ETransactionState {
  INITIAL = 'initial',
  INITIATED = 'initiated',
  DELIVERING = 'delivering',
  CANCELED = 'canceled',
  FAILED_DELIVERY = 'failed-delivery',
  DELIVERED = 'delivered',
  REVIEWED = 'reviewed',
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
