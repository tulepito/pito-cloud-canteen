/* eslint-disable import/no-cycle */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from 'react';
import { Form as FinalForm } from 'react-final-form';
import { useField, useForm } from 'react-final-form-hooks';
import { FormattedMessage, useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import classNames from 'classnames';
import arrayMutators from 'final-form-arrays';
import compact from 'lodash/compact';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import { useRouter } from 'next/router';

import Collapsible from '@components/Collapsible/Collapsible';
import ConfirmationModal from '@components/ConfirmationModal/ConfirmationModal';
import Form from '@components/Form/Form';
import { FieldDropdownSelectComponent } from '@components/FormFields/FieldDropdownSelect/FieldDropdownSelect';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconCopy from '@components/Icons/IconCopy/IconCopy';
import ReviewOrdersResultSection from '@components/OrderDetails/ReviewView/ReviewOrdersResultSection/ReviewOrdersResultSection';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import type { TColumn } from '@components/Table/Table';
import Table from '@components/Table/Table';
import Tabs from '@components/Tabs/Tabs';
import Tooltip from '@components/Tooltip/Tooltip';
import { addCommas, parseThousandNumber } from '@helpers/format';
import { getTrackingLink } from '@helpers/orderHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { AdminManageOrderThunks } from '@pages/admin/order/AdminManageOrder.slice';
import {
  changeStep4SubmitStatus,
  orderAsyncActions,
  saveDraftEditOrder,
} from '@redux/slices/Order.slice';
import { adminPaths } from '@src/paths';
import { Listing } from '@utils/data';
import { formatTimestamp } from '@utils/dates';
import { EOrderDraftStates, EOrderStates } from '@utils/enums';
import type { TKeyValue, TListing, TObject } from '@utils/types';
import { required } from '@utils/validators';

import NavigateButtons, {
  EFlowType,
} from '../../components/NavigateButtons/NavigateButtons';

import css from './ReviewOrder.module.scss';

const MenuColumns: TColumn[] = [
  {
    key: 'stt',
    label: 'STT',
    render: (data: any) => {
      return (
        <span title={data.id} className={classNames(css.rowText, css.rowId)}>
          {data.id}
        </span>
      );
    },
  },
  {
    key: 'foodName',
    label: 'Hạng mục',
    render: (data: any) => {
      return (
        <span title={data.id} className={classNames(css.rowText, css.rowId)}>
          {data.foodName}
        </span>
      );
    },
  },
  {
    key: 'dvt',
    label: 'ĐVT',
    render: (data: any) => {
      return (
        <span title={data.id} className={classNames(css.rowText, css.rowId)}>
          {data.foodUnit}
        </span>
      );
    },
  },
  {
    key: 'foodPrice',
    label: 'Đơn giá',
    render: (data: any) => {
      return (
        <span title={data.id} className={classNames(css.rowText, css.rowId)}>
          {addCommas(data.foodPrice)} đ
        </span>
      );
    },
  },
];

type TFormDeliveryInfoValues = {
  deliveryMan: string;
};

export const ReviewContent: React.FC<any> = (props) => {
  const {
    timeStamp,
    restaurant,
    deliveryManInfo = {},
    updatePlanDetail,
    foodOrder = {},
    onDownloadReviewOrderResults,
  } = props;
  const router = useRouter();
  const intl = useIntl();
  const menuCollapseController = useBoolean();
  const { key: deliveryManKey, phoneNumber: deliveryManPhoneNumber } =
    deliveryManInfo;
  const [currDeliveryPhoneNumber, setCurrDeliveryManPhoneNumber] = useState<
    string | undefined
  >(deliveryManPhoneNumber);

  const orderInDraftState = useAppSelector((state) => state.Order.order);
  const orderDetailInDraftState = useAppSelector(
    (state) => state.Order.orderDetail,
  );
  const orderInPickingState = useAppSelector(
    (state) => state.OrderManagement.orderData,
  );
  const orderDetailInPickingState = useAppSelector((state) => {
    const planListing = state.OrderManagement.planData;
    const { orderDetail = {} } = Listing(planListing as TListing).getMetadata();

    return orderDetail;
  });

  const participantData = useAppSelector(
    (state) => state.OrderManagement.participantData,
  );
  const anonymousParticipantData = useAppSelector(
    (state) => state.OrderManagement.anonymousParticipantData,
  );
  const deliveryManOptions = useAppSelector(
    (state) => state.SystemAttributes.deliveryPeople,
  );

  const isOrderDetailPage = router.pathname === adminPaths.OrderDetail;

  const defaultCopyText = intl.formatMessage({
    id: 'ReviewContent.copyToClipboardTooltip.default',
  });
  const copiedCopyText = intl.formatMessage({
    id: 'ReviewContent.copyToClipboardTooltip.copied',
  });

  const [copyToClipboardTooltip, setCopyToClipboardTooltip] =
    useState(defaultCopyText);

  const order = !isEmpty(orderInDraftState)
    ? orderInDraftState
    : orderInPickingState;

  const orderDetail = !isEmpty(orderDetailInDraftState)
    ? orderDetailInDraftState
    : orderDetailInPickingState;

  const { note } = orderDetail?.[timeStamp] || {};

  const { form } = useForm<TFormDeliveryInfoValues>({
    onSubmit: () => {},
    initialValues: {
      deliveryMan: deliveryManKey,
    },
  });
  const deliveryMan = useField('deliveryMan', form);

  const { totalDishes = 0, totalPrice = 0, foodDataList = [] } = foodOrder;

  const groupTitleClasses = classNames(css.groupTitle, {
    [css.collapsed]: menuCollapseController.value,
  });
  const rowsClasses = classNames(css.rows, {
    [css.collapsed]: menuCollapseController.value,
  });
  const iconClasses = classNames({
    [css.reversed]: menuCollapseController.value,
  });

  const {
    participants = [],
    anonymous = [],
    orderState,
    orderNote,
    orderStateHistory = [],
  } = Listing(order as TListing).getMetadata();
  const orderId = Listing(order as TListing).getId();
  const { restaurantName, phoneNumber, foodList = {} } = restaurant || {};
  const isInProgressOrder = orderState === EOrderStates.inProgress;
  const shouldShowTrackingLink =
    orderStateHistory.findIndex(
      (h: TObject) => h.state === EOrderStates.inProgress,
    ) >= 0;

  const parsedFoodList = Object.keys(foodList).map((key, index) => {
    return {
      key,
      data: {
        id: index + 1,
        foodName: foodList[key]?.foodName,
        foodPrice: foodList[key]?.foodPrice,
        foodUnit: foodList[key]?.foodUnit,
      },
    };
  }) as any;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getTrackingLink(orderId, timeStamp));
    setCopyToClipboardTooltip(copiedCopyText);
  };

  const handleToggleMenuCollapse = () => {
    menuCollapseController.toggle();
  };

  const handleFieldDeliveryManChange = (value: string) => {
    const currDeliveryInfoOption = deliveryManOptions.find(
      ({ key }: TKeyValue) => key === value,
    );

    updatePlanDetail(
      {
        deliveryManInfo: currDeliveryInfoOption,
      },
      true,
    );

    setCurrDeliveryManPhoneNumber(currDeliveryInfoOption?.phoneNumber);
  };

  const parsedDeliveryManOptions = useMemo(
    () =>
      deliveryManOptions.map((d: TObject) => ({
        key: d.key,
        label: d.name,
      })),
    [JSON.stringify(deliveryManOptions)],
  );

  useEffect(() => {
    setCurrDeliveryManPhoneNumber(deliveryManPhoneNumber);
  }, [deliveryManPhoneNumber]);

  return (
    <div>
      <RenderWhen condition={isInProgressOrder}>
        <ReviewOrdersResultSection
          className={css.reviewOrderResult}
          data={{
            participants,
            participantData,
            anonymous,
            anonymousParticipantData,
            orderDetail,
          }}
          onDownloadReviewOrderResults={onDownloadReviewOrderResults}
        />
      </RenderWhen>
      <div className={css.infoSection}>
        <RenderWhen condition={isOrderDetailPage}>
          <Collapsible
            label={intl.formatMessage({
              id: 'ReviewOrder.deliveryManInfoLabel',
            })}>
            <div className={classNames(css.contentBox, css.spaceStart)}>
              <div className={css.flexChild}>
                <span className={css.boxTitle}>
                  {intl.formatMessage({ id: 'ReviewOrder.deliveryManName' })}
                </span>
                <FieldDropdownSelectComponent
                  id={`${timeStamp}_deliveryMan`}
                  name="deliveryMan"
                  className={css.selectBoxContent}
                  meta={deliveryMan.meta}
                  options={parsedDeliveryManOptions}
                  placeholder="Chọn nhân viên"
                  input={deliveryMan.input}
                  customOnChange={handleFieldDeliveryManChange}
                />
              </div>
              <div className={css.flexChild}>
                <span className={css.boxTitle}>
                  {intl.formatMessage({ id: 'ReviewOrder.phoneNumberLabel' })}
                </span>
                <RenderWhen condition={!isEmpty(currDeliveryPhoneNumber)}>
                  <span className={css.boxContent}>
                    {currDeliveryPhoneNumber}
                  </span>
                </RenderWhen>

                <RenderWhen condition={shouldShowTrackingLink}>
                  <div className={css.billOfLading} onClick={handleCopyLink}>
                    {intl.formatMessage({ id: 'ReviewOrder.billOfLading' })}
                    <Tooltip
                      overlayClassName={css.toolTipOverlay}
                      trigger="hover"
                      tooltipContent={copyToClipboardTooltip}
                      placement="bottom">
                      <div>
                        <IconCopy className={css.copyIcon} />
                      </div>
                    </Tooltip>
                  </div>
                </RenderWhen>
              </div>
            </div>
          </Collapsible>
        </RenderWhen>
        <Collapsible
          label={intl.formatMessage({
            id: 'ReviewOrder.providerLabel',
          })}>
          <div className={classNames(css.contentBox, css.spaceStart)}>
            <div className={css.flexChild}>
              <span className={css.boxTitle}>
                {intl.formatMessage({ id: 'ReviewOrder.providerName' })}
              </span>
              <span className={css.boxContent}>{restaurantName}</span>
            </div>
            <div className={css.flexChild}>
              <span className={css.boxTitle}>
                {intl.formatMessage({ id: 'ReviewOrder.phoneNumberLabel' })}
              </span>
              <span className={css.boxContent}>{phoneNumber}</span>
            </div>
          </div>
        </Collapsible>
      </div>
      <Collapsible
        label={intl.formatMessage({
          id: 'ReviewOrder.menuLabel',
        })}>
        <RenderWhen
          condition={[
            EOrderDraftStates.draft,
            EOrderDraftStates.pendingApproval,
          ].includes(orderState)}>
          <Table
            columns={MenuColumns}
            data={parsedFoodList}
            tableClassName={css.tableRoot}
            tableHeadClassName={css.tableHead}
            tableHeadRowClassName={css.tableHeadRow}
            tableBodyClassName={css.tableBody}
            tableBodyRowClassName={css.tableBodyRow}
            tableBodyCellClassName={css.tableBodyCell}
          />

          <RenderWhen.False>
            <div className={css.tableContainer}>
              <div className={css.tableHead}>
                <div>
                  {intl.formatMessage({
                    id: 'ReviewOrder.tableHead.no',
                  })}
                </div>
                <div>
                  {intl.formatMessage({
                    id: 'ReviewOrder.tableHead.type',
                  })}
                </div>
                <div>
                  {intl.formatMessage({
                    id: 'ReviewOrder.tableHead.unit',
                  })}
                </div>
                <div>
                  {intl.formatMessage({
                    id: 'ReviewOrder.tableHead.quantity',
                  })}
                </div>

                <div>
                  {intl.formatMessage({
                    id: 'ReviewOrder.tableHead.price',
                  })}
                </div>
                <div></div>
              </div>

              <div className={css.tableBody}>
                <div className={css.tableRowGroup}>
                  <div className={groupTitleClasses}>
                    <div>{1}</div>
                    <div>
                      {intl.formatMessage({
                        id: 'ReviewOrder.table.menuTitle',
                      })}
                    </div>
                    <div>{''}</div>
                    <div>{totalDishes}</div>
                    <div>{parseThousandNumber(totalPrice || 0)}đ</div>
                    <div
                      className={css.actionCell}
                      onClick={handleToggleMenuCollapse}>
                      <IconArrow className={iconClasses} />
                    </div>
                  </div>
                  <div className={rowsClasses}>
                    {foodDataList.map((foodData: TObject, index: number) => {
                      const {
                        foodId = index,
                        foodPrice = 0,
                        foodUnit = '',
                        foodName = '',
                        frequency = 1,
                      } = foodData;

                      return (
                        <div className={css.row} key={foodId}>
                          <div></div>
                          <div>{foodName}</div>
                          <div>{foodUnit}</div>
                          <div>{frequency}</div>
                          <div>{parseThousandNumber(foodPrice || 0)}đ</div>
                          <div>{''}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </RenderWhen.False>
        </RenderWhen>
      </Collapsible>
      {(orderNote || note) && (
        <Collapsible
          label={intl.formatMessage({
            id: 'ReviewOrder.note',
          })}>
          <div className={classNames(css.contentBox, css.spaceStart)}>
            {orderNote || note}
          </div>
        </Collapsible>
      )}
    </div>
  );
};

const parseDataToReviewTab = (values: any) => {
  const { orderDetail = {}, ...rest } = values || {};
  const items = compact(
    Object.keys(orderDetail)
      .sort((a, b) => Number(a) - Number(b))
      .map((key: any) => {
        const { restaurant } = orderDetail[key] || {};

        if (isEmpty(restaurant) || isEmpty(restaurant?.foodList)) {
          return null;
        }

        return {
          key,
          label: formatTimestamp(Number(key)),
          childrenFn: (childProps: any) => <ReviewContent {...childProps} />,
          childrenProps: { ...orderDetail[key], ...rest, order: values },
        };
      }),
  );

  return items;
};

type TReviewOrder = {
  goBack: () => void;
  flowType?: EFlowType;
  tab?: string;
};

const ReviewOrder: React.FC<TReviewOrder> = (props) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const router = useRouter();

  const orderDetail = useAppSelector(
    (state) => state.Order.orderDetail,
    shallowEqual,
  );
  const order = useAppSelector((state) => state.Order.order, shallowEqual);
  const draftEditOrderData = useAppSelector(
    (state) => state.Order.draftEditOrderData.generalInfo,
  );
  const draftEditOrderDetail = useAppSelector(
    (state) => state.Order.draftEditOrderData.orderDetail,
  );
  const createOrderError = useAppSelector(
    (state) => state.Order.createOrderError,
  );
  const updateOrderInProgress = useAppSelector(
    (state) => state.Order.updateOrderInProgress,
  );
  const updateOrderDetailInProgress = useAppSelector(
    (state) => state.Order.updateOrderDetailInProgress,
  );
  const updateOrderStateInProgress = useAppSelector(
    (state) => state.AdminManageOrder.updateOrderStateInProgress,
  );

  const submitInProgress =
    updateOrderInProgress ||
    updateOrderDetailInProgress ||
    updateOrderStateInProgress;

  const {
    value: isSuccessModalOpen,
    setTrue: openSuccessModal,
    setFalse: closeSuccessModal,
  } = useBoolean();
  const isEditFlow = props.flowType === EFlowType.edit;
  const orderId = Listing(order as TListing).getId();
  const {
    staffName,
    deliveryHour,
    deliveryAddress,
    shipperName,
    orderState,
    plans = [],
    notes = {},
  } = Listing(order as TListing).getMetadata();
  const planId = plans.length > 0 ? plans[0] : undefined;
  const { address } = deliveryAddress || {};

  const { renderedOrderDetail } =
    useMemo(() => {
      return {
        renderedOrderDetail: parseDataToReviewTab({
          orderDetail: draftEditOrderDetail || orderDetail,
          deliveryHour: draftEditOrderData?.deliveryHour || deliveryHour,
          deliveryAddress:
            draftEditOrderData?.deliveryAddress || deliveryAddress,
          notes: draftEditOrderData?.notes || notes,
        }),
      };
    }, [
      deliveryAddress,
      deliveryHour,
      JSON.stringify(draftEditOrderData),
      JSON.stringify(orderDetail),
      JSON.stringify(draftEditOrderDetail),
    ]) || {};

  const handleGoBackToManageOrderPage = () => {
    router.push(adminPaths.ManageOrders);
  };

  const onSubmit = async (values: any) => {
    const { staffName: staffNameValue, shipperName: shipperNameValue } = values;
    if (isEditFlow) {
      if (planId && orderId) {
        await dispatch(
          orderAsyncActions.updatePlanDetail({
            orderId,
            planId,
            orderDetail: draftEditOrderDetail,
          }),
        );

        await dispatch(
          orderAsyncActions.updateOrder({
            generalInfo: {
              ...draftEditOrderData,
              staffName: staffNameValue,
              shipperName: shipperNameValue,
            },
          }),
        );

        await dispatch(
          saveDraftEditOrder({
            generalInfo: {
              staffName: staffNameValue,
              shipperName: shipperNameValue,
            },
          }),
        );
      }
    } else {
      dispatch(changeStep4SubmitStatus(true));

      if (orderState === EOrderDraftStates.draft) {
        await dispatch(
          AdminManageOrderThunks.requestApprovalOrder({ orderId }),
        );
      }

      const { error } = (await dispatch(
        orderAsyncActions.updateOrder({
          generalInfo: {
            staffName: staffNameValue,
            shipperName: shipperNameValue,
          },
        }),
      )) as any;

      if (!error) {
        openSuccessModal();
      }
      dispatch(changeStep4SubmitStatus(false));
    }
  };

  const onConfirm = () => {
    closeSuccessModal();
    router.push(adminPaths.ManageOrders);
  };

  const initialValues = useMemo(() => {
    return {
      staffName,
      shipperName,
    };
  }, [staffName, shipperName]);

  useEffect(() => {
    if (isEmpty(orderDetail) && !isEmpty(plans)) {
      dispatch(orderAsyncActions.fetchOrderDetail(plans));
    }
  }, [
    JSON.stringify(order),
    JSON.stringify(orderDetail),
    JSON.stringify(plans),
  ]);

  const missingSelectedFood =
    isEmpty(orderDetail) ||
    Object.keys(orderDetail).filter(
      (dateTime) => orderDetail[dateTime]?.restaurant?.foodList?.length === 0,
    )?.length === 0;
  const missingDraftSelectedFood =
    !isEmpty(draftEditOrderDetail) &&
    !isEqual(draftEditOrderDetail, orderDetail)
      ? Object.keys(draftEditOrderDetail).filter(
          (dateTime) =>
            draftEditOrderDetail?.[dateTime]?.restaurant?.foodList?.length ===
            0,
        )?.length === 0
      : missingSelectedFood;

  return (
    <div className={css.root}>
      <h1 className={css.title}>
        <FormattedMessage id="ReviewOrder.title" />
      </h1>
      <FinalForm
        mutators={{ ...arrayMutators }}
        {...props}
        initialValues={initialValues}
        onSubmit={onSubmit}
        render={(fieldRenderProps: any) => {
          const { tab, handleSubmit, goBack, flowType, invalid } =
            fieldRenderProps;

          const submitDisabled =
            invalid ||
            (isEditFlow && missingDraftSelectedFood) ||
            missingSelectedFood;

          return (
            <Form onSubmit={handleSubmit}>
              <Collapsible
                label={intl.formatMessage({ id: 'ReviewOrder.generalInfo' })}>
                <div className={css.contentBox}>
                  <div className={css.flexChild}>
                    <span className={css.boxTitle}>
                      {intl.formatMessage({ id: 'ReviewOrder.deliveryTime' })}
                    </span>
                    <span className={css.boxContent}>{deliveryHour}</span>
                  </div>
                  <div className={css.flexChild}>
                    <span className={css.boxTitle}>
                      {intl.formatMessage({ id: 'ReviewOrder.address' })}
                    </span>
                    <span className={css.boxContent}>{address}</span>
                  </div>
                  <div className={css.flexChild}>
                    <span className={css.boxTitle}>
                      {intl.formatMessage({ id: 'ReviewOrder.staffNameLabel' })}
                    </span>
                    <FieldTextInput
                      className={css.staffInput}
                      name="staffName"
                      id="staffName"
                      placeholder={intl.formatMessage({
                        id: 'ReviewOrder.staffNamePlaceholder',
                      })}
                      validate={required(
                        intl.formatMessage({
                          id: 'ReviewOrder.staffNameRequired',
                        }),
                      )}
                    />
                  </div>
                  <div className={css.flexChild}>
                    <span className={css.boxTitle}>
                      {intl.formatMessage({
                        id: 'ReviewOrder.shipperName.label',
                      })}
                    </span>
                    <FieldTextInput
                      className={css.staffInput}
                      name="shipperName"
                      id="shipperName"
                      placeholder={intl.formatMessage({
                        id: 'ReviewOrder.shipperName.placeholder',
                      })}
                      validate={required(
                        intl.formatMessage({
                          id: 'ReviewOrder.shipperName.required',
                        }),
                      )}
                    />
                  </div>
                </div>
              </Collapsible>
              <Tabs items={renderedOrderDetail as any} showNavigation />
              <NavigateButtons
                flowType={flowType}
                currentTab={tab}
                onCompleteClick={handleSubmit}
                onNextClick={handleGoBackToManageOrderPage}
                goBack={goBack}
                submitDisabled={submitDisabled}
                inProgress={submitInProgress}
              />
              {createOrderError && (
                <div className={css.error}>{createOrderError}</div>
              )}
            </Form>
          );
        }}
      />
      <ConfirmationModal
        id="SuccessOrderModal"
        isOpen={isSuccessModalOpen}
        onClose={closeSuccessModal}
        confirmText={intl.formatMessage({
          id: 'ReviewOrder.successModal.confirmText',
        })}
        title={intl.formatMessage({ id: 'ReviewOrder.successModal.title' })}
        description={intl.formatMessage({
          id: 'ReviewOrder.successModal.description',
        })}
        onConfirm={onConfirm}
      />
    </div>
  );
};

export default ReviewOrder;
