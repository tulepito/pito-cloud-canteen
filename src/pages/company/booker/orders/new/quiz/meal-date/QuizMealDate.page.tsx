import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import { DateTime } from 'luxon';
import { useRouter } from 'next/router';

import Modal from '@components/Modal/Modal';
import NamedLink from '@components/NamedLink/NamedLink';
import { convertHHmmStringToTimeParts } from '@helpers/dateHelpers';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { orderAsyncActions } from '@redux/slices/Order.slice';
import { companyPaths } from '@src/paths';
import { Listing, User } from '@utils/data';
import { formatTimestamp, getSelectedDaysOfWeek } from '@utils/dates';
import type { TListing } from '@utils/types';

import useRedirectAfterReloadPage from '../../hooks/useRedirectAfterReloadPage';
import QuizModal from '../components/QuizModal/QuizModal';

import type { TMealDateFormValues } from './MealDateForm/MealDateForm';
import MealDateForm from './MealDateForm/MealDateForm';
import Spinner from './Spinner';

import css from './QuizMealDate.module.scss';

const QuizMealDate = () => {
  const intl = useIntl();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const creatingOrderModalControl = useBoolean();
  const [formValues, setFormValues] = useState<TMealDateFormValues>(null!);
  const [formInvalid, setFormInvalid] = useState<boolean>(false);
  const submittingErrorControl = useBoolean();

  useRedirectAfterReloadPage();
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

  const { dayInWeek, startDate, endDate, deadlineDate, deadlineHour } =
    formValues || {};

  const selectedDays = getSelectedDaysOfWeek(startDate, endDate, dayInWeek);
  const formattedStartDate = startDate && formatTimestamp(startDate, 'd MMMM');
  const formattedEndDate = endDate && formatTimestamp(endDate, 'd MMMM');
  const initialValues = useMemo(
    () => ({
      dayInWeek: ['mon', 'tue', 'wed', 'thu', 'fri'],
      displayedDurationTime: '1',
      durationTime: '1',
      durationTimeMode: 'week',
    }),
    [],
  );
  const onFormSubmitClick = async () => {
    creatingOrderModalControl.setTrue();
    try {
      const { payload: orderListing }: { payload: any } = await dispatch(
        orderAsyncActions.createOrder({
          clientId: User(selectedCompany).getId(),
          bookerId: currentUser?.id?.uuid,
          generalInfo: {
            ...quiz,
            ...formValues,
            deadlineDate: DateTime.fromMillis(deadlineDate)
              .plus({
                ...convertHHmmStringToTimeParts(deadlineHour),
              })
              .toMillis(),
            deliveryAddress:
              User(selectedCompany).getPublicData().location || {},
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
      const { meta } = await dispatch(
        orderAsyncActions.updatePlanDetail({
          orderId,
          planId,
          orderDetail: recommendOrderDetail,
        }),
      );
      if (meta.requestStatus !== 'rejected') {
        router.push(`/company/booker/orders/draft/${orderId}`);
      } else {
        return submittingErrorControl.setFalse();
      }
    } catch (error) {
      return submittingErrorControl.setFalse();
    }
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
      submitText="Tạo đơn"
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
        {!submittingErrorControl.value && (
          <div>
            <Spinner />
          </div>
        )}
        <div className={css.initialOrderText}>
          {createOrderInProcess &&
            intl.formatMessage({
              id: 'QuizCreatingOrderPage.initializingOrder',
            })}
          {(recommendRestaurantInProgress || updateOrderDetailInProgress) &&
            intl.formatMessage({
              id: 'QuizCreatingOrderPage.initializingOrderDetail',
            })}
          {submittingErrorControl.value &&
            intl.formatMessage({
              id: 'QuizCreatingOrderPage.initializeOrderError',
            })}
        </div>
        {submittingErrorControl.value && (
          <div className={css.error}>
            <NamedLink
              title={'Thử lại lần nữa'}
              params={{ pathanme: companyPaths.CreateNewOrder }}
            />
          </div>
        )}
        {Listing(order as TListing).getAttributes()?.title &&
          !submittingErrorControl.value && (
            <div className={css.orderTitle}>
              {`#${Listing(order as TListing).getAttributes()?.title}`}
            </div>
          )}

        {startDate && endDate && !submittingErrorControl.value && (
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
