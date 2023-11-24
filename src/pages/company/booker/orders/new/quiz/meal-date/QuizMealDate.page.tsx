import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import type { TDaySession } from '@components/CalendarDashboard/helpers/types';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { QuizActions } from '@redux/slices/Quiz.slice';
import { CurrentUser, User } from '@src/utils/data';
import { EOrderType, QuizStep } from '@src/utils/enums';
import { INITIAL_DELIVERY_TIME_BASE_ON_DAY_SESSION } from '@src/utils/options';

import QuizModal from '../components/QuizModal/QuizModal';
import QuizCreateOrderLoadingModal from '../create-order-loading/QuizCreateOrderLoadingModal';
import { useQuizFlow } from '../hooks/useQuizFlow';
import { useQuizModalScrollControl } from '../hooks/useQuizModalScrollControl';

import type { TMealDateFormValues } from './MealDateForm/MealDateForm';
import MealDateForm from './MealDateForm/MealDateForm';

import css from './QuizMealDate.module.scss';

type TQuizMealDateProps = {
  stepInfo?: string;
};

const QuizMealDate: React.FC<TQuizMealDateProps> = ({ stepInfo }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const creatingOrderModalControl = useBoolean();
  const [formValues, setFormValues] = useState<TMealDateFormValues>(null!);
  const [formInvalid, setFormInvalid] = useState<boolean>(false);
  const quizData = useAppSelector((state) => state.Quiz.quiz, shallowEqual);
  const selectedCompany = useAppSelector((state) => state.Quiz.selectedCompany);
  const currentUser = useAppSelector((state) => state.user.currentUser);
  const previousOrder = useAppSelector((state) => state.Quiz.previousOrder);

  const {
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

  const { hasOrderBefore = false } = CurrentUser(currentUser!).getPrivateData();
  const hasPreviousOrder = previousOrder !== null;

  const {
    startDate,
    endDate,
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
      usePreviousData: hasPreviousOrder,
      startDate: startDate ? new Date(startDate).getTime() : undefined,
      endDate: endDate ? new Date(endDate).getTime() : undefined,
      dayInWeek: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
      orderType: EOrderType.normal,
      deadlineDate: deadlineDate ? new Date(deadlineDate).getTime() : undefined,
      orderDeadlineHour: orderDeadlineHour || '',
      orderDeadlineMinute: orderDeadlineMinute || '',
      deliveryHour:
        INITIAL_DELIVERY_TIME_BASE_ON_DAY_SESSION[daySession as TDaySession] ||
        '',
    }),
    [
      hasPreviousOrder,
      deadlineDate,
      endDate,
      orderDeadlineHour,
      orderDeadlineMinute,
      startDate,
      daySession,
    ],
  );

  const handleSubmitClick = async () => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const { startDate, endDate } = formValues;
    const normalizedFormValues = {
      ...formValues,
      startDate: new Date(startDate).getTime(),
      endDate: new Date(endDate).getTime(),
    };
    dispatch(QuizActions.updateQuiz(normalizedFormValues));

    submitCreateOrder(normalizedFormValues);
  };

  return !creatingOrderInProgress ? (
    <QuizModal
      id="QuizMealDateModal"
      isOpen={!creatingOrderModalControl.value}
      modalTitle={modalTitle}
      submitText={'Tìm nhà hàng'}
      onSubmit={handleSubmitClick}
      submitDisabled={formInvalid}
      modalContainerClassName={css.modalContainer}
      modalContentRef={modalContentRef}
      stepInfo={stepInfo}
      onBack={hasOrderBefore ? undefined : backStep}>
      <MealDateForm
        onSubmit={() => {}}
        hasPreviousOrder={hasPreviousOrder}
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
