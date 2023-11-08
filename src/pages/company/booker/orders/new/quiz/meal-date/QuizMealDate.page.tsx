import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import {
  AFTERNOON_SESSION,
  DINNER_SESSION,
  EVENING_SESSION,
  MORNING_SESSION,
} from '@components/CalendarDashboard/helpers/constant';
import type { TDaySession } from '@components/CalendarDashboard/helpers/types';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { QuizActions } from '@redux/slices/Quiz.slice';
import { CurrentUser, User } from '@src/utils/data';
import { QuizStep } from '@src/utils/enums';

import QuizModal from '../components/QuizModal/QuizModal';
import QuizCreateOrderLoadingModal from '../create-order-loading/QuizCreateOrderLoadingModal';
import { useQuizFlow } from '../hooks/useQuizFlow';
import { useQuizModalScrollControl } from '../hooks/useQuizModalScrollControl';

import type { TMealDateFormValues } from './MealDateForm/MealDateForm';
import MealDateForm from './MealDateForm/MealDateForm';

import css from './QuizMealDate.module.scss';

const INITIAL_DELIVERY_TIME_BASE_ON_DAY_SESSION = {
  [MORNING_SESSION]: '08:00-08:15',
  [AFTERNOON_SESSION]: '11:00-11:15',
  [EVENING_SESSION]: '18:00-18:15',
  [DINNER_SESSION]: '18:00-18:15',
};

const QuizMealDate = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const creatingOrderModalControl = useBoolean();
  const [formValues, setFormValues] = useState<TMealDateFormValues>(null!);
  const [formInvalid, setFormInvalid] = useState<boolean>(false);
  const quizData = useAppSelector((state) => state.Quiz.quiz, shallowEqual);
  const selectedCompany = useAppSelector((state) => state.Quiz.selectedCompany);
  const currentUser = useAppSelector((state) => state.user.currentUser);
  const { hasOrderBefore = false } = CurrentUser(currentUser!).getPrivateData();
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
    deadlineDate,
    orderDeadlineHour,
    orderDeadlineMinute,
    daySession,
  } = quizData;

  const modalTitle = intl.formatMessage(
    { id: 'QuizMealDate.title' },
    { companyName: User(selectedCompany).getPublicData().companyName },
  );

  const initialValues = useMemo(
    () => ({
      startDate: startDate ? new Date(startDate).getTime() : undefined,
      endDate: endDate ? new Date(endDate).getTime() : undefined,
      dayInWeek: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
      isGroupOrder: isGroupOrder || [],
      deadlineDate: deadlineDate ? new Date(deadlineDate).getTime() : undefined,
      orderDeadlineHour: orderDeadlineHour || '',
      orderDeadlineMinute: orderDeadlineMinute || '',
      deliveryHour:
        INITIAL_DELIVERY_TIME_BASE_ON_DAY_SESSION[daySession as TDaySession] ||
        '',
    }),
    [
      deadlineDate,
      endDate,
      isGroupOrder,
      orderDeadlineHour,
      orderDeadlineMinute,
      startDate,
      daySession,
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
      modalTitle={modalTitle}
      submitText={hasOrderBefore ? 'Tìm nhà hàng' : 'Tiếp tục'}
      onSubmit={onFormSubmitClick}
      submitDisabled={formInvalid}
      modalContainerClassName={css.modalContainer}
      modalContentRef={modalContentRef}
      onBack={hasOrderBefore ? undefined : backStep}>
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
