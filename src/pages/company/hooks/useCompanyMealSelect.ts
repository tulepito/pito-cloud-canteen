import { useAppDispatch } from '@hooks/reduxHooks';
import { QuizActions } from '@redux/slices/Quiz.slice';

import { BookerNewOrderAction } from '../booker/orders/new/BookerNewOrder.slice';

export const useCompanyMealSelect = () => {
  const dispatch = useAppDispatch();

  const handleMealClick = (daySession: string) => {
    dispatch(QuizActions.clearQuizData());
    dispatch(QuizActions.openQuizFlow());
    dispatch(BookerNewOrderAction.setCurrentStep(0));
    dispatch(
      QuizActions.updateQuiz({
        daySession,
      }),
    );
  };

  return {
    handleMealClick,
  };
};
