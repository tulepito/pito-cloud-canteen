import { useEffect, useState } from 'react';

import { useAppSelector } from '@hooks/reduxHooks';
import { CurrentUser } from '@src/utils/data';
import { QuizStep } from '@src/utils/enums';

import BookerNewOrderPage from '../BookerNewOrder.page';

import QuizInviteMember from './invite-member/QuizInviteMember';
import QuizMealDatePage from './meal-date/QuizMealDate.page';
import QuizMealStylesPage from './meal-styles/QuizMealStyles.page';
import QuizPerPackMemberAmountPage from './perpack-member-amount/QuizPerPackMemberAmount.page';
import QuizSpecialDemandPage from './special-demand/QuizSpecialDemand.page';

export const firstTimeQuizSteps = [
  {
    key: QuizStep.NEW_ORDER,
    component: <BookerNewOrderPage />,
  },
  {
    key: QuizStep.PACKAGE_PER_MEMBER,
    component: <QuizPerPackMemberAmountPage />,
  },
  {
    key: QuizStep.SPECIAL_DEMAND,
    component: <QuizSpecialDemandPage />,
  },
  {
    key: QuizStep.MEAL_STYLES,
    component: <QuizMealStylesPage />,
  },
  {
    key: QuizStep.MEAL_DATE,
    component: <QuizMealDatePage />,
  },
  {
    key: QuizStep.INVITE_MEMBER,
    component: <QuizInviteMember />,
  },
];

const secondTimeQuizFlowSteps = [
  {
    key: QuizStep.NEW_ORDER,
    component: <BookerNewOrderPage />,
  },
  {
    key: QuizStep.MEAL_DATE,
    component: <QuizMealDatePage />,
  },
];

const QuizFlow = () => {
  const currentStep = useAppSelector(
    (state) => state.BookerNewOrderPage.currentStep,
  );

  const currentUser = useAppSelector((state) => state.user.currentUser);
  const currentUserGetter = CurrentUser(currentUser!);
  const { hasOrderBefore = false } = currentUserGetter.getPrivateData();

  const [quizStepsWithComponent, setQuizStepsWithComponent] =
    useState<any>(firstTimeQuizSteps);

  useEffect(() => {
    if (hasOrderBefore) {
      setQuizStepsWithComponent(secondTimeQuizFlowSteps);
    }
  }, [hasOrderBefore]);

  return quizStepsWithComponent[currentStep].component;
};

export default QuizFlow;
