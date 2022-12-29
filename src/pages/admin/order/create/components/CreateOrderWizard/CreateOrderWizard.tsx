import FormWizard from '@components/FormWizard/FormWizard';
import { useRouter } from 'next/router';
import React from 'react';
import { useIntl } from 'react-intl';

import ClientSelector from '../../../StepScreen/ClientSelector/ClientSelector';
import MealPlanCreator from '../../../StepScreen/MealPlanCreator/MealPlanCreator';
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
  SERVICE_FEE_AND_NOTE_TAB,
  REVIEW_TAB,
];

const CreateOrderTab: React.FC<any> = (props) => {
  const { tab } = props;
  switch (tab) {
    case CLIENT_SELECT_TAB:
      return <ClientSelector />;
    case MEAL_PLAN_SETUP:
      return <MealPlanSetup />;
    case CREATE_MEAL_PLAN_TAB:
      return <MealPlanCreator />;
    case SERVICE_FEE_AND_NOTE_TAB:
      return <div>Service fee and note</div>;
    case REVIEW_TAB:
      return <ReviewOrder />;
    default:
      return <></>;
  }
};

const CreateOrderWizard = () => {
  const router = useRouter();
  const intl = useIntl();

  const { step } = router.query;
  const selectedTab = step || CLIENT_SELECT_TAB;

  const tabLink = (tab: string) => {
    return {
      path: `/admin/order/create`,
      to: { search: `step=${tab}` },
      replace: true,
    };
  };

  return (
    <FormWizard formTabNavClassName={css.formTabNav}>
      {TABS.map((tab: string) => {
        return (
          <CreateOrderTab
            key={tab}
            tabId={tab}
            selected={selectedTab === tab}
            tabLabel={intl.formatMessage({
              id: `CreateOrderWizard.${tab}Label`,
            })}
            tabLinkProps={tabLink(tab)}
            tab={selectedTab}
          />
        );
      })}
    </FormWizard>
  );
};

export default CreateOrderWizard;
