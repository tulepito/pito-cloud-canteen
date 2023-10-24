/* eslint-disable import/no-cycle */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';

import FormWizard from '@components/FormWizard/FormWizard';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { EFlowType } from '@pages/admin/order/components/NavigateButtons/NavigateButtons';
import ClientView from '@pages/admin/order/StepScreen/ClientView/ClientView';
import ReviewOrder from '@pages/admin/order/StepScreen/ReviewOrder/ReviewOrder';
import ServiceFeesAndNotes from '@pages/admin/order/StepScreen/ServiceFeesAndNotes/ServiceFeesAndNotes';
import SetupOrderDetail from '@pages/admin/order/StepScreen/SetupOrderDetail/SetupOrderDetail';
import { orderAsyncActions, resetOrder } from '@redux/slices/Order.slice';
import { adminPaths } from '@src/paths';

import MealPlanSetup from '../../../../StepScreen/MealPlanSetup/MealPlanSetup';

import css from './EditOrderWizard.module.scss';

export enum EEditOrderTab {
  clientView = 'clientView',
  orderSetup = 'orderSetup',
  restaurantSetup = 'restaurantSetup',
  manageFood = 'manageFood',
  serviceAndNote = 'serviceAndNote',
  review = 'review',
}

const EDIT_ORDER_TABS = [
  EEditOrderTab.clientView,
  EEditOrderTab.orderSetup,
  EEditOrderTab.restaurantSetup,
  EEditOrderTab.serviceAndNote,
  EEditOrderTab.review,
];

const EditOrderTab: React.FC<any> = (props) => {
  // eslint-disable-next-line unused-imports/no-unused-vars
  const { tab, goBack, nextTab, nextToReviewTab } = props;

  switch (tab) {
    case EEditOrderTab.clientView:
      return <ClientView nextTab={nextTab} nextToReviewTab={nextToReviewTab} />;
    case EEditOrderTab.orderSetup:
      return (
        <MealPlanSetup
          flowType={EFlowType.edit}
          nextTab={nextTab}
          nextToReviewTab={nextToReviewTab}
          goBack={goBack}
        />
      );
    case EEditOrderTab.restaurantSetup:
      return (
        <SetupOrderDetail
          flowType={EFlowType.edit}
          nextTab={nextTab}
          nextToReviewTab={nextToReviewTab}
          goBack={goBack}
        />
      );
    case EEditOrderTab.serviceAndNote:
      return (
        <ServiceFeesAndNotes
          flowType={EFlowType.edit}
          nextTab={nextTab}
          nextToReviewTab={nextToReviewTab}
          goBack={goBack}
        />
      );
    case EEditOrderTab.review:
      return (
        <ReviewOrder tab={tab} flowType={EFlowType.edit} goBack={goBack} />
      );

    case EEditOrderTab.manageFood:
    default:
      return <></>;
  }
};

const EditOrderWizard = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const {
    query: { orderId },
    isReady,
  } = router;
  const fetchOrderError = useAppSelector(
    (state) => state.Order.fetchOrderError,
  );
  const [currentStep, setCurrentStep] = useState<string>(
    EEditOrderTab.clientView,
  );

  useEffect(() => {
    if (fetchOrderError === 'Request failed with status code 400') {
      router.push(adminPaths.ManageOrders);
    }
  }, [fetchOrderError]);

  useEffect(() => {
    if (isReady) {
      if (orderId) {
        dispatch(orderAsyncActions.fetchOrder(orderId as string));
      }
    }
  }, [dispatch, isReady, orderId]);

  useEffect(() => {
    return () => {
      dispatch(resetOrder());
    };
  }, []);

  const saveStep = (tab: string) => {
    setCurrentStep(tab);
  };

  const handleNextToReviewTab = () => {
    saveStep(EEditOrderTab.review);
  };

  const handleNextTab = (tab: string) => () => {
    const tabIndex = EDIT_ORDER_TABS.indexOf(tab as EEditOrderTab);

    if (tabIndex < EDIT_ORDER_TABS.length - 1) {
      const backTab = EDIT_ORDER_TABS[tabIndex + 1];
      saveStep(backTab);
    }
  };

  const handleGoBack = (tab: string) => () => {
    const tabIndex = EDIT_ORDER_TABS.indexOf(tab as EEditOrderTab);

    if (tabIndex > 0) {
      const backTab = EDIT_ORDER_TABS[tabIndex - 1];
      saveStep(backTab);
    }
  };

  return (
    <FormWizard formTabNavClassName={css.formTabNav}>
      {EDIT_ORDER_TABS.map((tab: string) => {
        return (
          <EditOrderTab
            key={tab}
            tab={tab}
            tabId={tab}
            selected={currentStep === tab}
            tabLabel={intl.formatMessage({
              id: `EditOrderWizard.${tab}Label`,
            })}
            nextToReviewTab={handleNextToReviewTab}
            nextTab={handleNextTab(tab)}
            goBack={handleGoBack(tab)}
          />
        );
      })}
    </FormWizard>
  );
};

export default EditOrderWizard;
