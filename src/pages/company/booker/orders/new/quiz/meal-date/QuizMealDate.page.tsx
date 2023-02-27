import { useAppDispatch } from '@hooks/reduxHooks';
import { QuizActions } from '@redux/slices/Quiz.slice';
import { quizPaths } from '@src/paths';
import { getSelectedDaysOfWeek } from '@utils/dates';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import QuizModal from '../components/QuizModal/QuizModal';
import type { TMealDateFormValues } from './MealDateForm/MealDateForm';
import MealDateForm from './MealDateForm/MealDateForm';

const QuizMealDate = () => {
  const intl = useIntl();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [formValues, setFormValues] = useState<TMealDateFormValues>(null!);
  const [formInvalid, setFormInvalid] = useState<boolean>(false);

  const { dayInWeek, startDate, endDate } = formValues || {};
  const selectedDays = getSelectedDaysOfWeek(startDate, endDate, dayInWeek);

  const initialValues = useMemo(
    () => ({
      dayInWeek: ['mon', 'tue', 'wed', 'thu', 'fri'],
    }),
    [],
  );
  const onFormSubmitClick = () => {
    dispatch(
      QuizActions.updateQuiz({ ...formValues, dayInWeek: selectedDays }),
    );
    dispatch(QuizActions.allowCreateOrder());
    router.push(quizPaths.CreatingOrder);
  };

  const goBack = () => {
    router.back();
  };

  return (
    <QuizModal
      id="QuizMealDateModal"
      isOpen
      handleClose={() => {}}
      modalTitle={intl.formatMessage({ id: 'QuizMealDate.title' })}
      submitText="Tiếp tục"
      onSubmit={onFormSubmitClick}
      submitDisabled={formInvalid}
      onBack={goBack}>
      <MealDateForm
        onSubmit={() => {}}
        setFormValues={setFormValues}
        setFormInvalid={setFormInvalid}
        initialValues={initialValues}
      />
    </QuizModal>
  );
};

export default QuizMealDate;
