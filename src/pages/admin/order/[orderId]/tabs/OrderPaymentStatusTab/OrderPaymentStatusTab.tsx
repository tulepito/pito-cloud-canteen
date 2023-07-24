import { useEffect, useState } from 'react';
import { shallowEqual } from 'react-redux';
import isEmpty from 'lodash/isEmpty';

import IconCheckmarkWithCircle from '@components/Icons/IconCheckmark/IconCheckmarkWithCircle';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import Tabs from '@components/Tabs/Tabs';
import Tooltip from '@components/Tooltip/Tooltip';
import { calculatePriceQuotationPartner } from '@helpers/order/cartInfoHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { Listing } from '@src/utils/data';
import { getDayOfWeek } from '@src/utils/dates';
import type { EOrderStates } from '@src/utils/enums';
import type { TListing, TUser } from '@src/utils/types';

import OrderHeaderState from '../../components/OrderHeaderState/OrderHeaderState';
import { calculatePaidAmountBySubOrderDate } from '../../helpers/AdminOrderDetail';
import { OrderDetailThunks } from '../../OrderDetail.slice';

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
};

const OrderPaymentStatusTab: React.FC<OrderPaymentStatusTabProps> = (props) => {
  const {
    orderDetail,
    order,
    updateOrderState,
    updateOrderStateInProgress,
    quotations,
    company,
  } = props;
  const dispatch = useAppDispatch();
  const [selectedSubOrderDate, setSelectedSubOrderDate] = useState<string>('');

  const currentOrderVATPercentage = useAppSelector(
    (state) => state.SystemAttributes.currentOrderVATPercentage,
  );
  const partnerPaymentRecords = useAppSelector(
    (state) => state.OrderDetail.partnerPaymentRecords,
    shallowEqual,
  );

  const orderListing = Listing(order);
  const orderId = orderListing.getId();
  const { title: orderTitle } = orderListing.getAttributes();
  const { quotationId, serviceFees } = orderListing.getMetadata();
  const partnerCurrentQuotation = quotations.find(
    (_quotation) => _quotation.id.uuid === quotationId,
  );
  const partnerCurrentQuotationListing = Listing(partnerCurrentQuotation!);
  const { partner = {} } = partnerCurrentQuotationListing.getMetadata();

  const partnerTabItems =
    !isEmpty(quotations) &&
    Object.keys(orderDetail).map((subOrderDate: string) => {
      const partnerQuotationBySubOrderDate = calculatePriceQuotationPartner({
        quotation: partner[orderDetail[subOrderDate].restaurant.id]?.quotation,
        serviceFee: serviceFees[orderDetail[subOrderDate].restaurant.id],
        currentOrderVATPercentage,
        subOrderDate,
      });

      const { totalWithVAT } = partnerQuotationBySubOrderDate;
      const partnerPaymentRecordsByDate =
        partnerPaymentRecords[subOrderDate] || [];
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
            <div className={css.label}>
              {`${
                orderDetail[subOrderDate].restaurant.restaurantName
              } #${orderTitle}-${getDayOfWeek(+subOrderDate)}`}
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
        },
      };
    });

  useEffect(() => {
    if (orderId) {
      dispatch(OrderDetailThunks.fetchQuotations(orderId));
    }
  }, [dispatch, orderId]);

  useEffect(() => {
    dispatch(
      OrderDetailThunks.fetchPartnerPaymentRecords({
        paymentType: 'partner',
        orderId,
      }),
    );
  }, [dispatch, orderId]);

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
          <Tabs items={partnerTabItems as any} onChange={onTabChange} />
        </div>
      </RenderWhen>
    </div>
  );
};

export default OrderPaymentStatusTab;
