/* eslint-disable import/no-cycle */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';

import FormWizard from '@components/FormWizard/FormWizard';
import { setItem } from '@helpers/localStorageHelpers';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import ReviewOrder from '@pages/admin/order/StepScreen/ReviewOrder/ReviewOrder';
import ServiceFeesAndNotes from '@pages/admin/order/StepScreen/ServiceFeesAndNotes/ServiceFeesAndNotes';
import SetupOrderDetail from '@pages/admin/order/StepScreen/SetupOrderDetail/SetupOrderDetail';
import { orderAsyncActions, resetStates } from '@redux/slices/Order.slice';
import { EOrderType } from '@src/utils/enums';
import { Listing } from '@utils/data';
import type { TListing } from '@utils/types';

import ClientSelector from '../../../StepScreen/ClientSelector/ClientSelector';
// eslint-disable-next-line import/no-cycle, import/no-named-as-default
import MealPlanSetup from '../../../StepScreen/MealPlanSetup/MealPlanSetup';
// eslint-disable-next-line import/no-cycle
import FoodQuantitySection from '../FoodQuantitySection/FoodQuantitySection';

// eslint-disable-next-line import/no-cycle
import {
  checkAllRestaurantsFoodPicked,
  isGeneralInfoSetupCompleted,
} from './CreateOrderWizard.helper';

import css from './CreateOrderWizard.module.scss';

export const CLIENT_SELECT_TAB = 'clientSelect';
export const MEAL_PLAN_SETUP = 'mealPlanSetup';
export const CREATE_MEAL_PLAN_TAB = 'createMealPlan';
export const SERVICE_FEE_AND_NOTE_TAB = 'serviceFeeAndNote';
export const FOOD_QUANTITY_TAB = 'foodQuantity';
export const REVIEW_TAB = 'review';

export const GROUP_ORDER_TABS = [
  CLIENT_SELECT_TAB,
  MEAL_PLAN_SETUP,
  CREATE_MEAL_PLAN_TAB,
  SERVICE_FEE_AND_NOTE_TAB,
  REVIEW_TAB,
];

export const NORMAL_ORDER_TABS = [
  CLIENT_SELECT_TAB,
  MEAL_PLAN_SETUP,
  CREATE_MEAL_PLAN_TAB,
  FOOD_QUANTITY_TAB,
  SERVICE_FEE_AND_NOTE_TAB,
  REVIEW_TAB,
];

export const CREATE_ORDER_STEP_LOCAL_STORAGE_NAME = 'orderStep';

const tabCompleted = (
  order: any,
  tab: string,
  orderDetail: any,
  availableOrderDetailCheckList: any,
) => {
  const orderId = Listing(order).getId();
  const { staffName, plans = [], notes = {} } = Listing(order).getMetadata();

  const missingSelectedFood = Object.keys(orderDetail).filter(
    (dateTime) =>
      !isEmpty(orderDetail[dateTime]?.restaurant?.id) &&
      isEmpty(orderDetail[dateTime]?.restaurant?.foodList),
  );
  const isMealPlanTabCompleted =
    !isEmpty(plans) && isEmpty(missingSelectedFood);
  const hasInvalidMealDay = Object.keys(availableOrderDetailCheckList).some(
    (item) => !availableOrderDetailCheckList[item].isAvailable,
  );
  switch (tab) {
    case CLIENT_SELECT_TAB:
      return !isEmpty(orderId);
    case MEAL_PLAN_SETUP:
      return isGeneralInfoSetupCompleted(order as TListing);
    case CREATE_MEAL_PLAN_TAB:
      return (
        !isEmpty(orderId) &&
        !isEmpty(orderDetail) &&
        isMealPlanTabCompleted &&
        isGeneralInfoSetupCompleted(order as TListing) &&
        !hasInvalidMealDay
      );
    case SERVICE_FEE_AND_NOTE_TAB:
      return !isEmpty(notes) && isEmpty(missingSelectedFood);
    case REVIEW_TAB:
      return !!staffName && isEmpty(missingSelectedFood);
    case FOOD_QUANTITY_TAB:
      return isEmpty(missingSelectedFood);
    default:
      return <></>;
  }
};

const tabsActive = (
  order: any,
  orderDetail: any,
  availableOrderDetailCheckList: any,
  tabs: string[],
) => {
  return tabs.reduce((acc, tab) => {
    const previousTabIndex = tabs.findIndex((t) => t === tab) - 1;
    const isActive =
      previousTabIndex < 0 ||
      tabCompleted(
        order,
        tabs[previousTabIndex],
        orderDetail,
        availableOrderDetailCheckList,
      );

    return { ...acc, [tab]: isActive };
  }, {});
};

const CreateOrderTab: React.FC<any> = (props) => {
  const { tab, goBack, nextTab } = props;

  switch (tab) {
    case CLIENT_SELECT_TAB:
      return <ClientSelector nextTab={nextTab} />;
    case MEAL_PLAN_SETUP:
      return <MealPlanSetup goBack={goBack} nextTab={nextTab} />;
    case CREATE_MEAL_PLAN_TAB:
      return <SetupOrderDetail goBack={goBack} nextTab={nextTab} />;
    case FOOD_QUANTITY_TAB:
      return <FoodQuantitySection goBack={goBack} nextTab={nextTab} />;
    case SERVICE_FEE_AND_NOTE_TAB:
      return <ServiceFeesAndNotes goBack={goBack} nextTab={nextTab} />;
    case REVIEW_TAB:
      return <ReviewOrder goBack={goBack} />;
    default:
      return <></>;
  }
};

const CreateOrderWizard = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { orderId } = router.query;
  const [currentStep, setCurrentStep] = useState<string>(CLIENT_SELECT_TAB);
  const order = useAppSelector((state) => state.Order.order, shallowEqual);

  useEffect(() => {
    if (orderId) {
      dispatch(orderAsyncActions.fetchOrder(orderId as string));
    }
  }, [dispatch, orderId]);

  useEffect(() => {
    if (!orderId) {
      dispatch(resetStates());
    }
  }, []);

  const saveStep = (tab: string) => {
    setCurrentStep(tab);
    setItem(CREATE_ORDER_STEP_LOCAL_STORAGE_NAME, tab);
  };

  const onClick = (tab: string) => () => {
    saveStep(tab);
  };

  const orderType = Listing(order as TListing).getMetadata()?.orderType;
  const isNormalOrder = useMemo(
    () => orderType === EOrderType.normal,
    [orderType],
  );
  const tabsByOrderType = useMemo(
    () => (isNormalOrder ? NORMAL_ORDER_TABS : GROUP_ORDER_TABS),
    [orderType],
  );

  const nextTab = (tab: string) => () => {
    const tabIndex = tabsByOrderType.indexOf(tab);
    if (tabIndex < tabsByOrderType.length - 1) {
      const nextTabValue = tabsByOrderType[tabIndex + 1];
      saveStep(nextTabValue);
    }
  };

  const goBack = (tab: string) => () => {
    const tabIndex = tabsByOrderType.indexOf(tab);
    if (tabIndex > 0) {
      const backTab = tabsByOrderType[tabIndex - 1];
      saveStep(backTab);
    }
  };

  const step2SubmitInProgress = useAppSelector(
    (state) => state.Order.step2SubmitInProgress,
  );
  const step4SubmitInProgress = useAppSelector(
    (state) => state.Order.step4SubmitInProgress,
  );
  const orderDetail = useAppSelector(
    (state) => state.Order.orderDetail,
    shallowEqual,
  );
  const canNotGoAfterOderDetail = useAppSelector(
    (state) => state.Order.canNotGoAfterOderDetail,
  );
  const canNotGoAfterFoodQuantity = useAppSelector(
    (state) => state.Order.canNotGoAfterFoodQuantity,
  );
  const justDeletedMemberOrder = useAppSelector(
    (state) => state.Order.justDeletedMemberOrder,
  );
  const availableOrderDetailCheckList = useAppSelector(
    (state) => state.Order.availableOrderDetailCheckList,
    shallowEqual,
  );

  const {
    staffName,
    notes = {},
    plans = [],
  } = Listing(order as TListing).getMetadata();

  const tabsStatus = tabsActive(
    order,
    orderDetail,
    availableOrderDetailCheckList,
    tabsByOrderType,
  ) as any;

  useEffect(() => {
    if (order && !step2SubmitInProgress && !step4SubmitInProgress) {
      const isAllRestaurantsFoodPicked =
        checkAllRestaurantsFoodPicked(orderDetail);
      const isCreateMealPlanCompleted = isGeneralInfoSetupCompleted(
        order as TListing,
      );

      const canGoToReview =
        (isNormalOrder &&
          !canNotGoAfterOderDetail &&
          !canNotGoAfterFoodQuantity) ||
        (!isNormalOrder && !canNotGoAfterOderDetail);

      if (
        staffName &&
        canGoToReview &&
        isAllRestaurantsFoodPicked &&
        isCreateMealPlanCompleted
      ) {
        setItem(CREATE_ORDER_STEP_LOCAL_STORAGE_NAME, REVIEW_TAB);

        return setCurrentStep(REVIEW_TAB);
      }
      if (
        !isEmpty(notes) &&
        canGoToReview &&
        isAllRestaurantsFoodPicked &&
        isCreateMealPlanCompleted
      ) {
        setItem(CREATE_ORDER_STEP_LOCAL_STORAGE_NAME, SERVICE_FEE_AND_NOTE_TAB);

        return setCurrentStep(SERVICE_FEE_AND_NOTE_TAB);
      }
      if (
        isNormalOrder &&
        !canNotGoAfterOderDetail &&
        isAllRestaurantsFoodPicked
      ) {
        setItem(CREATE_ORDER_STEP_LOCAL_STORAGE_NAME, FOOD_QUANTITY_TAB);

        return setCurrentStep(FOOD_QUANTITY_TAB);
      }
      if (isCreateMealPlanCompleted) {
        setItem(CREATE_ORDER_STEP_LOCAL_STORAGE_NAME, CREATE_MEAL_PLAN_TAB);

        return setCurrentStep(CREATE_MEAL_PLAN_TAB);
      }
      setItem(CREATE_ORDER_STEP_LOCAL_STORAGE_NAME, MEAL_PLAN_SETUP);

      return setCurrentStep(MEAL_PLAN_SETUP);
    }
  }, [
    JSON.stringify(order),
    step2SubmitInProgress,
    JSON.stringify(orderDetail),
    step4SubmitInProgress,
    isNormalOrder,
  ]);

  useEffect(() => {
    if (!tabsStatus[currentStep as string]) {
      // If selectedTab is not active, redirect to the beginning of wizard
      const currentTabIndex = tabsByOrderType.indexOf(currentStep as string);
      const nearestActiveTab = tabsByOrderType
        .slice(0, currentTabIndex)
        .reverse()
        .find((t) => tabsStatus[t]);

      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      nearestActiveTab && setCurrentStep(nearestActiveTab);
    }
  }, [tabsStatus, currentStep]);

  useEffect(() => {
    if (isEmpty(orderDetail) && !justDeletedMemberOrder && !isEmpty(plans)) {
      dispatch(orderAsyncActions.fetchOrderDetail(plans));
    }
  }, [
    JSON.stringify(order),
    JSON.stringify(orderDetail),
    JSON.stringify(plans),
  ]);

  useEffect(() => {
    dispatch(orderAsyncActions.fetchOrderRestaurants({}));
  }, [JSON.stringify(orderDetail)]);

  if (!isNormalOrder && currentStep === FOOD_QUANTITY_TAB) return null;

  return (
    <FormWizard formTabNavClassName={css.formTabNav}>
      {tabsByOrderType.map((tab: string, index) => {
        const disabled =
          !tabCompleted(
            order,
            tabsByOrderType[index - 1],
            orderDetail,
            availableOrderDetailCheckList,
          ) ||
          (orderId && tab === CLIENT_SELECT_TAB);

        return (
          <CreateOrderTab
            key={tab}
            tabId={tab}
            selected={currentStep === tab}
            tabLabel={intl.formatMessage({
              id: `CreateOrderWizard.${tab}Label`,
            })}
            onClick={onClick(tab)}
            nextTab={nextTab(tab)}
            tab={tab}
            goBack={goBack(tab)}
            disabled={disabled}
          />
        );
      })}
    </FormWizard>
  );
};

export default CreateOrderWizard;
