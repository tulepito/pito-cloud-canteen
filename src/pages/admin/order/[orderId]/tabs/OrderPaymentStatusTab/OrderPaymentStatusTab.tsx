import { useEffect, useState } from 'react';
import { shallowEqual } from 'react-redux';
import compact from 'lodash/compact';
import isEmpty from 'lodash/isEmpty';

import IconCheckmarkWithCircle from '@components/Icons/IconCheckmark/IconCheckmarkWithCircle';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import Tabs from '@components/Tabs/Tabs';
import Tooltip from '@components/Tooltip/Tooltip';
import {
  calculatePriceQuotationInfo,
  calculatePriceQuotationPartner,
} from '@helpers/order/cartInfoHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { Listing } from '@src/utils/data';
import { getDayOfWeek } from '@src/utils/dates';
import {
  type EOrderStates,
  EPaymentType,
  ESubOrderStatus,
} from '@src/utils/enums';
import type { TListing, TUser } from '@src/utils/types';

import OrderHeaderState from '../../components/OrderHeaderState/OrderHeaderState';
import { calculatePaidAmountBySubOrderDate } from '../../helpers/AdminOrderDetail';
import { OrderDetailThunks } from '../../OrderDetail.slice';

import ClientPaymentDetail from './components/ClientPaymentDetail/ClientPaymentDetail';
import PartnerPaymentDetail from './components/PartnerPaymentDetail/PartnerPaymentDetail';

import css from './OrderPaymentStatusTab.module.scss';

type OrderPaymentStatusTabProps = {
  order: TListing;
  orderDetail: any;
  company: TUser;
  booker: TUser;
  quotations: TListing[];
  updateOrderState: (newOrderState: string) => void;
  updateOrderStateInProgress: boolean;
  subOrderDate?: string;
};

const OrderPaymentStatusTab: React.FC<OrderPaymentStatusTabProps> = (props) => {
  const {
    orderDetail,
    order,
    updateOrderState,
    updateOrderStateInProgress,
    quotations,
    company,
    subOrderDate: subOrderDateFromQuery,
  } = props;

  const dispatch = useAppDispatch();
  const [selectedSubOrderDate, setSelectedSubOrderDate] = useState<string>('');
  const [defaultActiveKey, setDefaultActiveKey] = useState<number>(1);

  const currentOrderVATPercentage = useAppSelector(
    (state) => state.SystemAttributes.currentOrderVATPercentage,
  );
  const partnerPaymentRecords = useAppSelector(
    (state) => state.OrderDetail.partnerPaymentRecords,
    shallowEqual,
  );

  const clientPaymentRecords = useAppSelector(
    (state) => state.OrderDetail.clientPaymentRecords,
    shallowEqual,
  );

  const orderListing = Listing(order);
  const orderId = orderListing.getId();
  const { title: orderTitle } = orderListing.getAttributes();
  const { quotationId, serviceFees, deliveryHour } = orderListing.getMetadata();
  const partnerCurrentQuotation = quotations.find(
    (_quotation) => _quotation.id.uuid === quotationId,
  );
  const partnerCurrentQuotationListing = Listing(partnerCurrentQuotation!);
  const { partner = {} } = partnerCurrentQuotationListing.getMetadata();

  const partnerTabItems = !isEmpty(quotations)
    ? compact(
        Object.keys(orderDetail).map((subOrderDate: string) => {
          if (
            isEmpty(
              partner[orderDetail[subOrderDate].restaurant.id]?.quotation,
            ) ||
            orderDetail[subOrderDate].status === ESubOrderStatus.CANCELED ||
            !orderDetail[subOrderDate].transactionId
          ) {
            return null;
          }

          const partnerQuotationBySubOrderDate = calculatePriceQuotationPartner(
            {
              quotation:
                partner[orderDetail[subOrderDate].restaurant.id]?.quotation,
              serviceFee: serviceFees[orderDetail[subOrderDate].restaurant.id],
              currentOrderVATPercentage,
              subOrderDate,
            },
          );

          const { totalWithVAT } = partnerQuotationBySubOrderDate;
          const partnerPaymentRecordsByDate =
            partnerPaymentRecords?.[subOrderDate]?.filter(
              (_record) => !_record.isHideFromHistory,
            ) || [];
          const paidAmount = calculatePaidAmountBySubOrderDate(
            partnerPaymentRecordsByDate,
          );
          const showCheckmark = totalWithVAT === paidAmount;

          return {
            key: subOrderDate,
            label: (
              <Tooltip
                placement="bottomLeft"
                overlayClassName={css.tooltipOverlay}
                overlayInnerStyle={{
                  backgroundColor: '#fff',
                  padding: 0,
                }}
                tooltipContent={
                  <div className={css.tooltipName}>{`${
                    orderDetail[subOrderDate].restaurant.restaurantName
                  } #${orderTitle}-${getDayOfWeek(+subOrderDate)}`}</div>
                }>
                <div className={css.labelWrapper}>
                  <div className={css.label}>
                    {`${
                      orderDetail[subOrderDate].restaurant.restaurantName
                    } #${orderTitle}-${getDayOfWeek(+subOrderDate)}`}
                  </div>
                  <RenderWhen condition={showCheckmark}>
                    <IconCheckmarkWithCircle className={css.checkIcon} />
                  </RenderWhen>
                </div>
              </Tooltip>
            ),
            childrenFn: (childProps: any) => (
              <PartnerPaymentDetail {...childProps} />
            ),
            childrenProps: {
              partnerName: orderDetail[subOrderDate].restaurant.restaurantName,
              subOrderDate: selectedSubOrderDate,
              orderId,
              partnerId: orderDetail[subOrderDate].restaurant.id,
              partnerPaymentRecordsByDate,
              totalWithVAT,
              paidAmount,
              company,
              orderTitle,
              deliveryHour,
            },
          };
        }),
      )
    : null;

  const { totalWithVAT: clientTotalPrice } = calculatePriceQuotationInfo({
    planOrderDetail: orderDetail,
    order,
    currentOrderVATPercentage,
  });

  const clientPaidAmount =
    calculatePaidAmountBySubOrderDate(clientPaymentRecords);
  const showClientCheckmark = clientTotalPrice === clientPaidAmount;
  const clientTabItem = {
    key: 'client',
    label: (
      <div className={css.clientLabel}>
        <span>Khách hàng</span>
        <RenderWhen condition={showClientCheckmark}>
          <IconCheckmarkWithCircle className={css.checkIcon} />
        </RenderWhen>
      </div>
    ),
    childrenFn: (childProps: any) => <ClientPaymentDetail {...childProps} />,
    childrenProps: {
      totalWithVAT: clientTotalPrice,
      orderId,
      paymentType: EPaymentType.CLIENT,
      company,
      orderTitle,
      paidAmount: clientPaidAmount,
      deliveryHour,
      clientPaymentRecords: clientPaymentRecords?.filter(
        (_record) => !_record.isHideFromHistory,
      ),
    },
  };

  const totalTabItems = [clientTabItem].concat(partnerTabItems as any[]);

  useEffect(() => {
    if (orderId) {
      dispatch(OrderDetailThunks.fetchQuotations(orderId));
    }
  }, [dispatch, orderId]);

  useEffect(() => {
    dispatch(OrderDetailThunks.fetchPartnerPaymentRecords(orderId));
    dispatch(OrderDetailThunks.fetchClientPaymentRecords(orderId));
  }, [dispatch, orderId]);

  useEffect(() => {
    if (subOrderDateFromQuery) {
      const tabIndexMaybe =
        (partnerTabItems || []).findIndex(
          (item) => item.key === subOrderDateFromQuery,
        ) + 1;
      setDefaultActiveKey(tabIndexMaybe === 0 ? 1 : tabIndexMaybe);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subOrderDateFromQuery, partnerTabItems]);

  const handleUpdateOrderState = (state: EOrderStates) => () => {
    updateOrderState(state);
  };

  const onTabChange = (tab: any) => {
    setSelectedSubOrderDate(tab?.key);
  };

  return (
    <div>
      <OrderHeaderState
        order={order}
        handleUpdateOrderState={handleUpdateOrderState}
        updateOrderStateInProgress={updateOrderStateInProgress}
      />
      <RenderWhen condition={!isEmpty(quotations)}>
        <div className={css.tabContainer}>
          <Tabs
            items={totalTabItems as any}
            onChange={onTabChange}
            defaultActiveKey={`${defaultActiveKey}`}
          />
        </div>
      </RenderWhen>
    </div>
  );
};

export default OrderPaymentStatusTab;
