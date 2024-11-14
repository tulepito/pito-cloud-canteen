import { useCallback } from 'react';
import { shallowEqual } from 'react-redux';
import router from 'next/router';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { orderAsyncActions } from '@redux/slices/Order.slice';
import { QuizActions } from '@redux/slices/Quiz.slice';
import { userThunks } from '@redux/slices/user.slice';
import { CurrentUser, Listing } from '@src/utils/data';
import { QuizStep } from '@src/utils/enums';
import type { TListing } from '@src/utils/types';

import { BookerDraftOrderPageActions } from '../../../draft/[orderId]/BookerDraftOrderPage.slice';
import { BookerNewOrderAction } from '../../BookerNewOrder.slice';

const quizSteps = [
  QuizStep.PACKAGE_PER_MEMBER,
  QuizStep.SPECIAL_DEMAND,
  QuizStep.MEAL_DATE,
  QuizStep.INVITE_MEMBER,
  QuizStep.ORDER_CREATING,
];

const secondQuizSteps = [QuizStep.MEAL_DATE, QuizStep.ORDER_CREATING];

export const useQuizFlow = (step: string) => {
  const dispatch = useAppDispatch();
  const creatingOrderModalControl = useBoolean();
  const submittingErrorControl = useBoolean();

  const previousOrder = useAppSelector(
    (state) => state.Quiz.previousOrder,
    shallowEqual,
  );
  const quizData = useAppSelector((state) => state.Quiz.quiz);
  const isCopyPreviousOrder = useAppSelector(
    (state) => state.Quiz.isCopyPreviousOrder,
  );
  const reorderOpen = useAppSelector((state) => state.Quiz.reorderOpen);

  const selectedCompany = useAppSelector(
    (state) => state.Quiz.selectedCompany,
    shallowEqual,
  );
  const currentUser = useAppSelector((state) => state.user.currentUser);
  const currentUserGetter = CurrentUser(currentUser!);
  const { hasOrderBefore = false, quizData: bookerQuizData } =
    currentUserGetter.getPrivateData();
  const currentQuizSteps = hasOrderBefore ? secondQuizSteps : quizSteps;
  const nextStep = () => {
    const nextStepIndex =
      currentQuizSteps.findIndex((_step) => _step === step) + 1;
    dispatch(BookerNewOrderAction.setCurrentStep(nextStepIndex));
  };

  const backStep = () => {
    const backStepIndex =
      currentQuizSteps.findIndex((_step) => _step === step) - 1;
    dispatch(BookerNewOrderAction.setCurrentStep(backStepIndex));
  };

  const submitCreateOrder = useCallback(
    async (submitQuizData?: any) => {
      creatingOrderModalControl.setTrue();
      submittingErrorControl.setFalse();

      try {
        const { meta, payload: orderListing }: { meta: any; payload: any } =
          await dispatch(
            orderAsyncActions.createOrder({
              isCreatedByAdmin: false,
            }),
          );
        const orderId = Listing(orderListing as TListing).getId();

        if (!isCopyPreviousOrder && !reorderOpen) {
          const { plans = [] } = Listing(
            orderListing as TListing,
          ).getMetadata();
          const planId = plans[0];
          const { payload: recommendOrderDetail }: any = await dispatch(
            orderAsyncActions.recommendRestaurants({}),
          );
          await dispatch(
            orderAsyncActions.updatePlanDetail({
              orderId,
              planId,
              orderDetail: recommendOrderDetail,
            }),
          );
        }
        if (meta.requestStatus !== 'rejected') {
          if (!hasOrderBefore) {
            await dispatch(
              userThunks.updateProfile({
                privateData: {
                  hasOrderBefore: true,
                  quizData: {
                    packagePerMember: quizData.packagePerMember,
                    memberAmount: quizData.memberAmount,
                    daySession:
                      submitQuizData?.daySession || quizData.daySession,
                    deliveryHour:
                      submitQuizData?.deliveryHour || quizData.deliveryHour,
                    mealStyles: quizData.mealStyles || [],
                    nutritions: quizData.nutritions || [],
                    mealType: quizData.mealType || [],
                  },
                },
              }),
            );
          }
          dispatch(QuizActions.closeQuizFlow());
          dispatch(BookerNewOrderAction.setCurrentStep(0));
          dispatch(
            BookerDraftOrderPageActions.setToastShowedAfterSuccessfullyCreatingOrder(
              true,
            ),
          );

          await router.push({
            pathname: `/company/booker/orders/draft/${orderId}`,
            query: { ...router.query },
          });
        }
      } catch (error) {
        submittingErrorControl.setTrue();
      } finally {
        creatingOrderModalControl.setFalse();
      }
    },
    [
      creatingOrderModalControl,
      submittingErrorControl,
      hasOrderBefore,
      isCopyPreviousOrder,
      reorderOpen,
      quizData,
      JSON.stringify(bookerQuizData),
      JSON.stringify(previousOrder),
      JSON.stringify(selectedCompany),
      dispatch,
    ],
  );

  const handleCloseQuizFlow = useCallback(async () => {
    dispatch(QuizActions.closeQuizFlow());
    dispatch(BookerNewOrderAction.setCurrentStep(0));
  }, [dispatch]);

  return {
    creatingOrderInProgress: creatingOrderModalControl.value,
    creatingOrderError: submittingErrorControl.value,
    nextStep,
    backStep,
    submitCreateOrder,
    handleCloseQuizFlow,
  };
};
