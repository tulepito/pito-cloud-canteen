/* eslint-disable import/no-cycle */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
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
import { orderAsyncActions, resetOrder } from '@redux/slices/Order.slice';
import { Listing } from '@utils/data';
import type { TListing } from '@utils/types';

import ClientSelector from '../../../StepScreen/ClientSelector/ClientSelector';
import MealPlanSetup from '../../../StepScreen/MealPlanSetup/MealPlanSetup';

import { isGeneralInfoSetupCompleted } from './CreateOrderWizard.helper';

import css from './CreateOrderWizard.module.scss';

export const CLIENT_SELECT_TAB = 'clientSelect';
export const MEAL_PLAN_SETUP = 'mealPlanSetup';
export const CREATE_MEAL_PLAN_TAB = 'createMealPlan';
export const SERVICE_FEE_AND_NOTE_TAB = 'serviceFeeAndNote';
export const REVIEW_TAB = 'review';

export const TABS = [
  CLIENT_SELECT_TAB,
  MEAL_PLAN_SETUP,
  CREATE_MEAL_PLAN_TAB,
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
      return !isEmpty(notes);
    case REVIEW_TAB:
      return !!staffName;
    default:
      return <></>;
  }
};

const tabsActive = (
  order: any,
  orderDetail: any,
  availableOrderDetailCheckList: any,
) => {
  return TABS.reduce((acc, tab) => {
    const previousTabIndex = TABS.findIndex((t) => t === tab) - 1;
    const isActive =
      previousTabIndex < 0 ||
      tabCompleted(
        order,
        TABS[previousTabIndex],
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
  const fetchOrderInProgress = useAppSelector(
    (state) => state.Order.fetchOrderInProgress,
  );

  useEffect(() => {
    if (orderId) {
      dispatch(orderAsyncActions.fetchOrder(orderId as string));
    }
  }, [dispatch, orderId]);

  useEffect(() => {
    if (!orderId) {
      dispatch(resetOrder());
    }
  }, []);

  const saveStep = (tab: string) => {
    setCurrentStep(tab);
    setItem(CREATE_ORDER_STEP_LOCAL_STORAGE_NAME, tab);
  };

  const onClick = (tab: string) => () => {
    saveStep(tab);
  };

  const nextTab = (tab: string) => () => {
    const tabIndex = TABS.indexOf(tab);
    if (tabIndex < TABS.length - 1) {
      const backTab = TABS[tabIndex + 1];
      saveStep(backTab);
    }
  };

  const goBack = (tab: string) => () => {
    const tabIndex = TABS.indexOf(tab);
    if (tabIndex > 0) {
      const backTab = TABS[tabIndex - 1];
      saveStep(backTab);
    }
  };

  const order = useAppSelector((state) => state.Order.order, shallowEqual);
  const { staffName, notes = {} } = Listing(order as TListing).getMetadata();
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
  const canNotGoToStep4 = useAppSelector(
    (state) => state.Order.canNotGoToStep4,
  );
  const availableOrderDetailCheckList = useAppSelector(
    (state) => state.Order.availableOrderDetailCheckList,
    shallowEqual,
  );

  const tabsStatus = tabsActive(
    order,
    orderDetail,
    availableOrderDetailCheckList,
  ) as any;

  useEffect(() => {
    if (order && !step2SubmitInProgress && !step4SubmitInProgress) {
      if (staffName && !canNotGoToStep4) {
        setItem(CREATE_ORDER_STEP_LOCAL_STORAGE_NAME, REVIEW_TAB);

        return setCurrentStep(REVIEW_TAB);
      }
      if (!isEmpty(notes) && !canNotGoToStep4) {
        setItem(CREATE_ORDER_STEP_LOCAL_STORAGE_NAME, SERVICE_FEE_AND_NOTE_TAB);

        return setCurrentStep(SERVICE_FEE_AND_NOTE_TAB);
      }
      if (isGeneralInfoSetupCompleted(order as TListing)) {
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
  ]);

  useEffect(() => {
    if (!tabsStatus[currentStep as string]) {
      // If selectedTab is not active, redirect to the beginning of wizard
      const currentTabIndex = TABS.indexOf(currentStep as string);
      const nearestActiveTab = TABS.slice(0, currentTabIndex)
        .reverse()
        .find((t) => tabsStatus[t]);

      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      nearestActiveTab && setCurrentStep(nearestActiveTab);
    }
  }, [tabsStatus, currentStep]);

  useEffect(() => {
    if (!fetchOrderInProgress) {
      dispatch(orderAsyncActions.fetchOrderRestaurants({ isEditFlow: true }));
    }
  }, [fetchOrderInProgress, JSON.stringify(orderDetail)]);

  return (
    <FormWizard formTabNavClassName={css.formTabNav}>
      {TABS.map((tab: string, index) => {
        const disabled =
          !tabCompleted(
            order,
            TABS[index - 1],
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
