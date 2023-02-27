import Modal from '@components/Modal/Modal';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { orderAsyncActions } from '@redux/slices/Order.slice';
import { QuizActions } from '@redux/slices/Quiz.slice';
import { Listing, User } from '@utils/data';
import { parseTimestampToFormat } from '@utils/dates';
import type { TListing } from '@utils/types';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import css from './QuizCreatingOrder.module.scss';
import Spinner from './Spinner';

const QuizCreatingOrderPage = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const router = useRouter();
  const allowCreateOrder = useAppSelector(
    (state) => state.Quiz.allowCreateOrder,
  );
  const selectedCompany = useAppSelector(
    (state) => state.Quiz.selectedCompany,
    shallowEqual,
  );
  const currentUser = useAppSelector((state) => state.user.currentUser);
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
  const quiz = useAppSelector((state) => state.Quiz.quiz, shallowEqual);

  const { startDate, endDate } = Listing(order as TListing).getMetadata();
  const formattedStartDate =
    startDate && parseTimestampToFormat(startDate, 'dd MMMM');
  const formattedEndDate =
    endDate && parseTimestampToFormat(endDate, 'dd MMMM');
  useEffect(() => {
    (async () => {
      if (allowCreateOrder) {
        dispatch(QuizActions.disallowCreateOrder());
        await dispatch(
          orderAsyncActions.createOrder({
            clientId: User(selectedCompany).getId(),
            bookerId: currentUser?.id?.uuid,
          }),
        );
        const { payload }: { payload: any } = await dispatch(
          orderAsyncActions.updateOrder({ generalInfo: quiz }),
        );
        const { orderListing } = payload || {};
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
      }
    })();
  }, [
    allowCreateOrder,
    currentUser?.id?.uuid,
    dispatch,
    quiz,
    selectedCompany,
    router,
  ]);

  return (
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
          {recommendRestaurantInProgress &&
            updateOrderDetailInProgress &&
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

export default QuizCreatingOrderPage;
