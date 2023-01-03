import FormWizard from '@components/FormWizard/FormWizard';
import { useAppDispatch } from '@hooks/reduxHooks';
import { manageCompaniesThunks } from '@redux/slices/ManageCompaniesPage.slice';
import CalendarPage from '@src/pages/calendar/CalendarPage.page';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

import ClientSelector from '../../../StepScreen/ClientSelector/ClientSelector';
import MealPlanSetup from '../../../StepScreen/MealPlanSetup/MealPlanSetup';
import ReviewOrder from '../ReviewOrder/ReviewOrder';
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

const CreateOrderTab: React.FC<any> = (props) => {
  const { tab, goBack } = props;
  switch (tab) {
    case CLIENT_SELECT_TAB:
      return <ClientSelector />;
    case MEAL_PLAN_SETUP:
      return <MealPlanSetup />;
    case CREATE_MEAL_PLAN_TAB:
      return <CalendarPage />;
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
  const onClick = (tab: string) => () => {
    setCurrentStep(tab);
  };

  const goBack = (tab: string) => () => {
    const tabIndex = TABS.indexOf(tab);
    if (tabIndex > 0) {
      const backTab = TABS[tabIndex - 1];
      setCurrentStep(backTab);
    }
  };

  return (
    <>
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
            />
          );
        })}
      </FormWizard>
    </>
  );
};

export default CreateOrderWizard;
