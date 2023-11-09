import { useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { resetOrder } from '@redux/slices/Order.slice';
import { currentUserSelector } from '@redux/slices/user.slice';
import { CurrentUser } from '@src/utils/data';
import { QuizStep } from '@src/utils/enums';

import QuizMealDatePage from './meal-date/QuizMealDate.page';
import QuizPerPackMemberAmountPage from './perpack-member-amount/QuizPerPackMemberAmount.page';
import QuizSpecialDemandPage from './special-demand/QuizSpecialDemand.page';

export const firstTimeQuizSteps = [
  {
    key: QuizStep.PACKAGE_PER_MEMBER,
    component: <QuizPerPackMemberAmountPage stepInfo="1/3" />,
  },
  {
    key: QuizStep.SPECIAL_DEMAND,
    component: <QuizSpecialDemandPage stepInfo="2/3" />,
  },
  {
    key: QuizStep.MEAL_DATE,
    component: <QuizMealDatePage stepInfo="3/3" />,
  },
];

const secondTimeQuizFlowSteps = [
  {
    key: QuizStep.MEAL_DATE,
    component: <QuizMealDatePage />,
  },
];

const QuizFlow = () => {
  const dispatch = useAppDispatch();
  const currentStep = useAppSelector(
    (state) => state.BookerNewOrderPage.currentStep,
  );
  const currentUser = useAppSelector(currentUserSelector);

  const { hasOrderBefore = false } = CurrentUser(currentUser!).getPrivateData();

  const [quizStepsWithComponent, setQuizStepsWithComponent] =
    useState<any>(firstTimeQuizSteps);

  useEffect(() => {
    dispatch(resetOrder());
  }, [dispatch]);

  useEffect(() => {
    if (hasOrderBefore) {
      setQuizStepsWithComponent(secondTimeQuizFlowSteps);
    }
  }, [hasOrderBefore]);

  return quizStepsWithComponent[currentStep].component;
};

export default QuizFlow;
