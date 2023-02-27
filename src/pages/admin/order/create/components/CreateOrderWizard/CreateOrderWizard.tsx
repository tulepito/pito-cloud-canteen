/* eslint-disable react-hooks/exhaustive-deps */
import FormWizard from '@components/FormWizard/FormWizard';
import { getItem, setItem } from '@helpers/localStorageHelpers';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { orderAsyncActions, resetOrder } from '@redux/slices/Order.slice';
import { Listing } from '@utils/data';
import type { TListing } from '@utils/types';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import ClientSelector from '../../../StepScreen/ClientSelector/ClientSelector';
// eslint-disable-next-line import/no-cycle, import/no-named-as-default
// eslint-disable-next-line import/no-named-as-default, import/no-cycle
import MealPlanSetup from '../../../StepScreen/MealPlanSetup/MealPlanSetup';
// eslint-disable-next-line import/no-cycle
import ReviewOrder from '../ReviewOrder/ReviewOrder';
// eslint-disable-next-line import/no-cycle
import SetupOrderDetail from '../SetupOrderDetail/SetupOrderDetail';
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
  REVIEW_TAB,
];

export const CREATE_ORDER_STEP_LOCAL_STORAGE_NAME = 'orderStep';

const tabCompleted = (order: any, tab: string, orderDetail: any) => {
  const orderId = Listing(order).getId();
  const { staffName, plans = [] } = Listing(order).getMetadata();

  const missingSelectedFood = Object.keys(orderDetail).filter((dateTime) =>
    isEmpty(orderDetail[dateTime].restaurant.foodList),
  );
  const isMealPlanTabCompleted =
    !isEmpty(plans) && isEmpty(missingSelectedFood);

  switch (tab) {
    case CLIENT_SELECT_TAB:
      return !isEmpty(orderId);
    case MEAL_PLAN_SETUP:
      return isGeneralInfoSetupCompleted(order as TListing);
    case CREATE_MEAL_PLAN_TAB:
      return (
        !isEmpty(orderId) &&
        isMealPlanTabCompleted &&
        isGeneralInfoSetupCompleted(order as TListing)
      );
    case REVIEW_TAB:
      return !!staffName;
    default:
      return <></>;
  }
};

const tabsActive = (order: any, orderDetail: any) => {
  return TABS.reduce((acc, tab) => {
    const previousTabIndex = TABS.findIndex((t) => t === tab) - 1;
    const isActive =
      previousTabIndex < 0 ||
      tabCompleted(order, TABS[previousTabIndex], orderDetail);

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
    case REVIEW_TAB:
      return <ReviewOrder goBack={goBack} />;
    default:
      return <></>;
  }
};

const CreateOrderWizard = () => {
  const stepFromLocal = getItem(CREATE_ORDER_STEP_LOCAL_STORAGE_NAME);
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { orderId } = router.query;
  const [currentStep, setCurrentStep] = useState<string>(
    stepFromLocal || CLIENT_SELECT_TAB,
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
  const orderDetail = useAppSelector(
    (state) => state.Order.orderDetail,
    shallowEqual,
  );
  const tabsStatus = tabsActive(order, orderDetail) as any;

  useEffect(() => {
    if (order) {
      const { staffName } = Listing(order as TListing).getMetadata();
      if (staffName) {
        setItem(CREATE_ORDER_STEP_LOCAL_STORAGE_NAME, REVIEW_TAB);

        return setCurrentStep(REVIEW_TAB);
      }
      if (isGeneralInfoSetupCompleted(order as TListing)) {
        setItem(CREATE_ORDER_STEP_LOCAL_STORAGE_NAME, CREATE_MEAL_PLAN_TAB);

        return setCurrentStep(CREATE_MEAL_PLAN_TAB);
      }
      setItem(CREATE_ORDER_STEP_LOCAL_STORAGE_NAME, MEAL_PLAN_SETUP);

      return setCurrentStep(MEAL_PLAN_SETUP);
    }
  }, [JSON.stringify(order)]);

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

  return (
    <FormWizard formTabNavClassName={css.formTabNav}>
      {TABS.map((tab: string, index) => {
        const disabled =
          !tabCompleted(order, TABS[index - 1], orderDetail) ||
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
