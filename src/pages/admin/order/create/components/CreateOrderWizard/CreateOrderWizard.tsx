import FormWizard from '@components/FormWizard/FormWizard';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { manageCompaniesThunks } from '@redux/slices/ManageCompaniesPage.slice';
import { getItem, setItem } from '@utils/localStorageHelpers';
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

const tabCompleted = (draftOrder: any, tab: string) => {
  const {
    clientId,
    deliveryAddress,
    staffName,
    orderDetail = {},
  } = draftOrder || {};
  const isMealPlanTabCompleted = Object.entries(orderDetail).length > 0;

  switch (tab) {
    case CLIENT_SELECT_TAB:
      return clientId;
    case MEAL_PLAN_SETUP:
      return deliveryAddress;
    case CREATE_MEAL_PLAN_TAB:
      return isMealPlanTabCompleted;
    case REVIEW_TAB:
      return !!staffName;
    default:
      return <></>;
  }
};

const tabsActive = (order: any) => {
  return TABS.reduce((acc, tab) => {
    const previousTabIndex = TABS.findIndex((t) => t === tab) - 1;
    const isActive =
      previousTabIndex >= 0
        ? tabCompleted(order, TABS[previousTabIndex])
        : true;
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
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const [currentStep, setCurrentStep] = useState<string>(CLIENT_SELECT_TAB);

  useEffect(() => {
    if (currentStep === CLIENT_SELECT_TAB)
      dispatch(manageCompaniesThunks.queryCompanies());
  }, [currentStep, dispatch]);

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

  // const { draftOrder } = getPersistState('Order');
  const { draftOrder } = useAppSelector((state) => state.Order, shallowEqual);
  const tabsStatus = tabsActive(draftOrder) as any;

  useEffect(() => {
    const stepFromLocal = getItem(CREATE_ORDER_STEP_LOCAL_STORAGE_NAME);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    stepFromLocal && setCurrentStep(stepFromLocal);
  }, []);

  useEffect(() => {
    // If selectedTab is not active, redirect to the beginning of wizard
    if (!tabsStatus[currentStep as string]) {
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
        const disabled = !tabCompleted(draftOrder, TABS[index - 1]);

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
            draftOrder={draftOrder}
            disabled={disabled}
          />
        );
      })}
    </FormWizard>
  );
};

export default CreateOrderWizard;
