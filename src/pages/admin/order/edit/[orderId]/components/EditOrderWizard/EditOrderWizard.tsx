/* eslint-disable import/no-cycle */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';

import FormWizard from '@components/FormWizard/FormWizard';
import { ORDER_STATES_TO_ENABLE_EDIT_ABILITY } from '@helpers/orderHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { EFlowType } from '@pages/admin/order/components/NavigateButtons/NavigateButtons';
import ClientView from '@pages/admin/order/StepScreen/ClientView/ClientView';
import ManageFood from '@pages/admin/order/StepScreen/ManageFood/ManageFood';
import ReviewOrder from '@pages/admin/order/StepScreen/ReviewOrder/ReviewOrder';
import ServiceFeesAndNotes from '@pages/admin/order/StepScreen/ServiceFeesAndNotes/ServiceFeesAndNotes';
import SetupOrderDetail from '@pages/admin/order/StepScreen/SetupOrderDetail/SetupOrderDetail';
import { orderAsyncActions, resetOrder } from '@redux/slices/Order.slice';
import { adminPaths } from '@src/paths';
import { Listing } from '@src/utils/data';
import { EOrderType } from '@src/utils/enums';

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

const EDIT_GROUP_ORDER_TABS = [
  EEditOrderTab.clientView,
  EEditOrderTab.orderSetup,
  EEditOrderTab.restaurantSetup,
  EEditOrderTab.serviceAndNote,
  EEditOrderTab.review,
];

const EDIT_NORMAL_ORDER_TABS = [
  EEditOrderTab.clientView,
  EEditOrderTab.orderSetup,
  EEditOrderTab.restaurantSetup,
  EEditOrderTab.manageFood,
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
    case EEditOrderTab.manageFood:
      return (
        <ManageFood
          nextTab={nextTab}
          nextToReviewTab={nextToReviewTab}
          goBack={goBack}
        />
      );
    case EEditOrderTab.review:
      return (
        <ReviewOrder tab={tab} flowType={EFlowType.edit} goBack={goBack} />
      );

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
  } = router;
  const fetchOrderInProgress = useAppSelector(
    (state) => state.Order.fetchOrderInProgress,
  );
  const fetchOrderError = useAppSelector(
    (state) => state.Order.fetchOrderError,
  );
  const justDeletedMemberOrder = useAppSelector(
    (state) => state.Order.justDeletedMemberOrder,
  );
  const order = useAppSelector((state) => state.Order.order);
  const orderDetail = useAppSelector((state) => state.Order.orderDetail);
  const [currentStep, setCurrentStep] = useState<string>(
    EEditOrderTab.clientView,
  );

  const {
    orderState,
    orderType = EOrderType.group,
    plans = [],
  } = Listing(order).getMetadata();
  const isGroupOrder = orderType === EOrderType.group;
  const isInvalidOrderStateToEdit =
    !ORDER_STATES_TO_ENABLE_EDIT_ABILITY.includes(orderState);
  const suitableTabList = isGroupOrder
    ? EDIT_GROUP_ORDER_TABS
    : EDIT_NORMAL_ORDER_TABS;

  const saveStep = (tab: string) => {
    setCurrentStep(tab);
  };

  const handleTabClick = (tab: string) => () => {
    saveStep(tab);
  };

  const handleNextToReviewTab = () => {
    saveStep(EEditOrderTab.review);
  };

  const handleNextTab = (tab: string) => () => {
    const tabIndex = suitableTabList.indexOf(tab as EEditOrderTab);

    if (tabIndex < suitableTabList.length - 1) {
      const backTab = suitableTabList[tabIndex + 1];
      saveStep(backTab);
    }
  };

  const handleGoBack = (tab: string) => () => {
    const tabIndex = suitableTabList.indexOf(tab as EEditOrderTab);

    if (tab === EEditOrderTab.review) {
      router.push(adminPaths.ManageOrders);

      return;
    }

    if (tabIndex > 0) {
      const backTab = suitableTabList[tabIndex - 1];
      saveStep(backTab);
    }
  };

  useEffect(() => {
    if (
      fetchOrderError === 'Request failed with status code 400' ||
      (isInvalidOrderStateToEdit && order !== null && !isEmpty(order))
    ) {
      router.push(adminPaths.ManageOrders);
    }
  }, [fetchOrderError, isInvalidOrderStateToEdit, JSON.stringify(order)]);

  useEffect(() => {
    if (!fetchOrderInProgress) {
      dispatch(orderAsyncActions.fetchOrderRestaurants({ isEditFlow: true }));
    }
  }, [fetchOrderInProgress]);

  useEffect(() => {
    if (orderId) {
      dispatch(orderAsyncActions.fetchOrder(orderId as string));
    }
  }, [orderId]);

  useEffect(() => {
    dispatch(resetOrder());
  }, []);

  useEffect(() => {
    if (isEmpty(orderDetail) && !justDeletedMemberOrder && !isEmpty(plans)) {
      dispatch(orderAsyncActions.fetchOrderDetail(plans));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    JSON.stringify(order),
    JSON.stringify(orderDetail),
    JSON.stringify(plans),
  ]);

  return (
    <FormWizard formTabNavClassName={css.formTabNav}>
      {suitableTabList.map((tab: string) => {
        return (
          <EditOrderTab
            key={tab}
            tab={tab}
            tabId={tab}
            selected={currentStep === tab}
            tabLabel={intl.formatMessage({
              id: `EditOrderWizard.${tab}Label`,
            })}
            onClick={handleTabClick(tab)}
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
