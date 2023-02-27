import Modal from '@components/Modal/Modal';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { orderAsyncActions } from '@redux/slices/Order.slice';
import { Listing, User } from '@utils/data';
import { getSelectedDaysOfWeek, parseTimestampToFormat } from '@utils/dates';
import type { TListing } from '@utils/types';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import QuizModal from '../components/QuizModal/QuizModal';
import type { TMealDateFormValues } from './MealDateForm/MealDateForm';
import MealDateForm from './MealDateForm/MealDateForm';
import css from './QuizMealDate.module.scss';
import Spinner from './Spinner';

const QuizMealDate = () => {
  const intl = useIntl();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const creatingOrderModalControl = useBoolean();
  const [formValues, setFormValues] = useState<TMealDateFormValues>(null!);
  const [formInvalid, setFormInvalid] = useState<boolean>(false);

  const selectedCompany = useAppSelector(
    (state) => state.Quiz.selectedCompany,
    shallowEqual,
  );
  const currentUser = useAppSelector((state) => state.user.currentUser);
  const quiz = useAppSelector((state) => state.Quiz.quiz, shallowEqual);

  const createOrderInProcess = useAppSelector(
    (state) => state.Order.createOrderInProcess,
  );
  const recommendRestaurantInProgress = useAppSelector(
    (state) => state.Order.recommendRestaurantInProgress,
  );

  const updateOrderDetailInProgress = useAppSelector(
    (state) => state.Order.updateOrderDetailInProgress,
  );
  const order = useAppSelector((state) => state.Order.order, shallowEqual);

  const { dayInWeek, startDate, endDate } = formValues || {};

  const selectedDays = getSelectedDaysOfWeek(startDate, endDate, dayInWeek);
  const formattedStartDate =
    startDate && parseTimestampToFormat(startDate, 'dd MMMM');
  const formattedEndDate =
    endDate && parseTimestampToFormat(endDate, 'dd MMMM');
  const initialValues = useMemo(
    () => ({
      dayInWeek: ['mon', 'tue', 'wed', 'thu', 'fri'],
    }),
    [],
  );
  const onFormSubmitClick = async () => {
    creatingOrderModalControl.setTrue();
    const { payload: orderListing }: { payload: any } = await dispatch(
      orderAsyncActions.createOrder({
        clientId: User(selectedCompany).getId(),
        bookerId: currentUser?.id?.uuid,
        generalInfo: {
          ...quiz,
          ...formValues,
          dayInWeek: selectedDays,
        },
      }),
    );
    const orderId = Listing(orderListing as TListing).getId();
    const { plans = [] } = Listing(orderListing as TListing).getMetadata();
    const planId = plans[0];
    const { payload: recommendOrderDetail }: any = await dispatch(
      orderAsyncActions.recommendRestaurants(),
    );
    await dispatch(
      orderAsyncActions.updatePlanDetail({
        orderId,
        planId,
        orderDetail: recommendOrderDetail,
      }),
    );
    router.push(`/company/booker/orders/draft/${orderId}`);
  };

  const goBack = () => {
    router.back();
  };

  return !creatingOrderModalControl.value ? (
    <QuizModal
      id="QuizMealDateModal"
      isOpen={!creatingOrderModalControl.value}
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
  ) : (
    <Modal isOpen handleClose={() => {}} shouldHideIconClose>
      <div className={css.container}>
        <div>
          <Spinner />
        </div>
        <div className={css.initialOrderText}>
          {createOrderInProcess &&
            intl.formatMessage({
              id: 'QuizCreatingOrderPage.initializingOrder',
            })}
          {(recommendRestaurantInProgress || updateOrderDetailInProgress) &&
            intl.formatMessage({
              id: 'QuizCreatingOrderPage.initializingOrderDetail',
            })}
        </div>
        {Listing(order as TListing).getAttributes()?.title && (
          <div className={css.orderTitle}>
            {`#${Listing(order as TListing).getAttributes()?.title}`}
          </div>
        )}

        {startDate && endDate && (
          <div className={css.orderDateWrapper}>
            <span>
              {intl.formatMessage({
                id: 'QuizCreatingOrderPage.orderTimeRange',
              })}
            </span>
            <span
              className={
                css.orderDateRange
              }>{`${formattedStartDate} - ${formattedEndDate}`}</span>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default QuizMealDate;
