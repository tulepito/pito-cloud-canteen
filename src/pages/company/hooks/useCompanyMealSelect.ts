import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { QuizActions } from '@redux/slices/Quiz.slice';
import { currentUserSelector } from '@redux/slices/user.slice';
import { CurrentUser } from '@src/utils/data';

import { BookerNewOrderAction } from '../booker/orders/new/BookerNewOrder.slice';

export const useCompanyMealSelect = () => {
  const dispatch = useAppDispatch();

  const currentUser = useAppSelector(currentUserSelector);
  const { hasOrderBefore = false } = CurrentUser(currentUser!).getPrivateData();

  const openQuizWithSession = (daySession: string) => {
    dispatch(QuizActions.openQuizFlow());
    dispatch(QuizActions.updateQuiz({ daySession }));
  };

  const handleMealClick = (daySession: string) => {
    if (hasOrderBefore) {
      dispatch(QuizActions.clearQuizData());
      dispatch(BookerNewOrderAction.setCurrentStep(0));
    }

    openQuizWithSession(daySession);
  };

  return {
    handleMealClick,
  };
};
