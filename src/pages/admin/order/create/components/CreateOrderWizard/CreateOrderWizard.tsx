import FormWizard from '@components/FormWizard/FormWizard';
import { getItem, setItem } from '@utils/localStorageHelpers';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

import ClientSelector from '../../../StepScreen/ClientSelector/ClientSelector';
// eslint-disable-next-line import/no-cycle
import MealPlanSetup from '../../../StepScreen/MealPlanSetup/MealPlanSetup';
// eslint-disable-next-line import/no-cycle
import ReviewOrder from '../ReviewOrder/ReviewOrder';
// eslint-disable-next-line import/no-cycle
import SelectRestaurantPage from '../SelectRestaurantPage/SelectRestaurant.page';
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

export const DRAFT_ORDER_LOCAL_STORAGE_NAME = 'draftOrder';
export const CREATE_ORDER_STEP_LOCAL_STORAGE_NAME = 'orderStep';

const tabCompleted = (order: any, tab: string) => {
  const { generalInfo = {} } = order || {};
  const { staffName } = generalInfo;
  switch (tab) {
    case CLIENT_SELECT_TAB:
      return true;
    case MEAL_PLAN_SETUP:
      return true;
    case CREATE_MEAL_PLAN_TAB:
      return true;
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
  const { tab, goBack } = props;
  switch (tab) {
    case CLIENT_SELECT_TAB:
      return <ClientSelector />;
    case MEAL_PLAN_SETUP:
      return <MealPlanSetup goBack={goBack} />;
    case CREATE_MEAL_PLAN_TAB:
      return <SelectRestaurantPage goBack={goBack} />;
    case REVIEW_TAB:
      return <ReviewOrder goBack={goBack} />;
    default:
      return <></>;
  }
};

const CreateOrderWizard = () => {
  const intl = useIntl();
  const [currentStep, setCurrentStep] = useState<string>(CLIENT_SELECT_TAB);

  const saveStep = (tab: string) => {
    setCurrentStep(tab);
    setItem(CREATE_ORDER_STEP_LOCAL_STORAGE_NAME, tab);
  };

  const onClick = (tab: string) => () => {
    saveStep(tab);
  };

  const goBack = (tab: string) => () => {
    const tabIndex = TABS.indexOf(tab);
    if (tabIndex > 0) {
      const backTab = TABS[tabIndex - 1];
      saveStep(backTab);
    }
  };

  const draftOrder = getItem(DRAFT_ORDER_LOCAL_STORAGE_NAME);

  const tabsStatus = tabsActive(getItem(DRAFT_ORDER_LOCAL_STORAGE_NAME)) as any;

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
      {TABS.map((tab: string) => {
        return (
          <CreateOrderTab
            key={tab}
            tabId={tab}
            selected={currentStep === tab}
            tabLabel={intl.formatMessage({
              id: `CreateOrderWizard.${tab}Label`,
            })}
            onClick={onClick(tab)}
            tab={tab}
            goBack={goBack(tab)}
            draftOrder={draftOrder}
          />
        );
      })}
    </FormWizard>
  );
};

export default CreateOrderWizard;
