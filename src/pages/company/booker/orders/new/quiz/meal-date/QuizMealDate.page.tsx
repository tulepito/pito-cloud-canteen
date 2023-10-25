import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { QuizActions } from '@redux/slices/Quiz.slice';
import { CurrentUser } from '@src/utils/data';
import { QuizStep } from '@src/utils/enums';

import QuizModal from '../components/QuizModal/QuizModal';
import QuizCreateOrderLoadingModal from '../create-order-loading/QuizCreateOrderLoadingModal';
import { useQuizFlow } from '../hooks/useQuizFlow';
import { useQuizModalScrollControl } from '../hooks/useQuizModalScrollControl';

import type { TMealDateFormValues } from './MealDateForm/MealDateForm';
import MealDateForm from './MealDateForm/MealDateForm';

import css from './QuizMealDate.module.scss';

const QuizMealDate = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const creatingOrderModalControl = useBoolean();
  const [formValues, setFormValues] = useState<TMealDateFormValues>(null!);
  const [formInvalid, setFormInvalid] = useState<boolean>(false);
  const quizData = useAppSelector((state) => state.Quiz.quiz, shallowEqual);
  const currentUser = useAppSelector((state) => state.user.currentUser);
  const currentUserGetter = CurrentUser(currentUser!);
  const { hasOrderBefore = false } = currentUserGetter.getPrivateData();
  const {
    nextStep,
    backStep,
    submitCreateOrder,
    creatingOrderInProgress,
    creatingOrderError,
  } = useQuizFlow(QuizStep.MEAL_DATE);

  const {
    modalContentRef,
    onClickOrderDates,
    onClickDeliveryHour,
    onClickIsGroupOrder,
    onClickDeadlineDate,
  } = useQuizModalScrollControl();

  const {
    startDate,
    endDate,
    isGroupOrder,
    daySession,
    deadlineDate,
    orderDeadlineHour,
    orderDeadlineMinute,
  } = quizData;

  const initialValues = useMemo(
    () => ({
      startDate: startDate ? new Date(startDate).getTime() : undefined,
      endDate: endDate ? new Date(endDate).getTime() : undefined,
      dayInWeek: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
      isGroupOrder: isGroupOrder || [],
      deadlineDate: deadlineDate ? new Date(deadlineDate).getTime() : undefined,
      orderDeadlineHour: orderDeadlineHour || '',
      orderDeadlineMinute: orderDeadlineMinute || '',
      daySession: daySession || '',
    }),
    [
      daySession,
      deadlineDate,
      endDate,
      isGroupOrder,
      orderDeadlineHour,
      orderDeadlineMinute,
      startDate,
    ],
  );

  const onFormSubmitClick = async () => {
    dispatch(QuizActions.updateQuiz({ ...formValues }));
    const { isGroupOrder: isGroupOrderFormValue } = formValues;
    if (hasOrderBefore || isGroupOrderFormValue?.length === 0) {
      submitCreateOrder(formValues);
    } else {
      nextStep();
    }
  };

  return !creatingOrderInProgress ? (
    <QuizModal
      id="QuizMealDateModal"
      isOpen={!creatingOrderModalControl.value}
      modalTitle={intl.formatMessage({ id: 'QuizMealDate.title' })}
      submitText={hasOrderBefore ? 'Tìm nhà hàng' : 'Tiếp tục'}
      onSubmit={onFormSubmitClick}
      submitDisabled={formInvalid}
      modalContainerClassName={css.modalContainer}
      modalContentRef={modalContentRef}
      onBack={backStep}>
      <MealDateForm
        onSubmit={() => {}}
        setFormValues={setFormValues}
        setFormInvalid={setFormInvalid}
        initialValues={initialValues}
        onClickOrderDates={onClickOrderDates}
        onClickDeliveryHour={onClickDeliveryHour}
        onClickIsGroupOrder={onClickIsGroupOrder}
        onClickDeadlineDate={onClickDeadlineDate}
      />
    </QuizModal>
  ) : (
    <QuizCreateOrderLoadingModal creatingOrderError={creatingOrderError} />
  );
};

export default QuizMealDate;
