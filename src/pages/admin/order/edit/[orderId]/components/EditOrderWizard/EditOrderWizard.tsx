/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';

import FormWizard from '@components/FormWizard/FormWizard';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import ClientView from '@pages/admin/order/StepScreen/ClientView/ClientView';
import { orderAsyncActions, resetOrder } from '@redux/slices/Order.slice';
import { adminPaths } from '@src/paths';

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
  const { tab, goBack, nextTab } = props;

  switch (tab) {
    case EEditOrderTab.clientView:
      return <ClientView nextTab={nextTab} />;
    case EEditOrderTab.orderSetup:
    case EEditOrderTab.restaurantSetup:
    case EEditOrderTab.serviceAndNote:
    case EEditOrderTab.manageFood:
    case EEditOrderTab.review:
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

  const nextTab = (tab: string) => () => {
    const tabIndex = EDIT_ORDER_TABS.indexOf(tab as EEditOrderTab);

    if (tabIndex < EDIT_ORDER_TABS.length - 1) {
      const backTab = EDIT_ORDER_TABS[tabIndex + 1];
      saveStep(backTab);
    }
  };

  const goBack = (tab: string) => () => {
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
            nextTab={nextTab(tab)}
            goBack={goBack(tab)}
          />
        );
      })}
    </FormWizard>
  );
};

export default EditOrderWizard;
