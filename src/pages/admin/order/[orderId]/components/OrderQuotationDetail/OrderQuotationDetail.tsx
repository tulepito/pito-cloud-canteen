/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo, useState } from 'react';

import ReviewCartSection from '@components/OrderDetails/ReviewView/ReviewCartSection/ReviewCartSection';
import ReviewOrderDetailsSection from '@components/OrderDetails/ReviewView/ReviewOrderDetailsSection/ReviewOrderDetailsSection';
import Tabs from '@components/Tabs/Tabs';
import {
  calculatePriceQuotationInfo,
  calculatePriceQuotationPartner,
} from '@helpers/order/cartInfoHelper';
import { groupFoodOrderByDate } from '@helpers/order/orderDetailHelper';
import { useAppSelector } from '@hooks/reduxHooks';
import { useDownloadPriceQuotation } from '@hooks/useDownloadPriceQuotation';
import { Listing } from '@src/utils/data';
import { EOrderType } from '@src/utils/enums';
import type { TListing, TObject, TUser } from '@src/utils/types';

import {
  formatPriceQuotationData,
  formatPriceQuotationDataPartner,
  formatQuotationToFoodTableData,
} from '../../helpers/AdminOrderDetail';

import css from './OrderQuotationDetail.module.scss';

type OrderQuotationDetailProps = {
  quotation?: TListing;
  target: 'client' | 'partner';
  orderDetail?: TObject;
  order: TListing;
  company: TUser;
  booker: TUser;
};
const OrderQuotationDetail: React.FC<OrderQuotationDetailProps> = (props) => {
  const { quotation, target, orderDetail, order, company, booker } = props;

  const isPartner = target === 'partner';
  const quotationListing = Listing(quotation!);
  const quotationDetail = useMemo(
    () => quotationListing.getMetadata()[target] || {},
    [quotationListing, target],
  );
  const currentOrderVATPercentage = useAppSelector(
    (state) => state.Order.currentOrderVATPercentage,
  );

  const [currentPartnerId, setCurrentPartnerId] = useState<string>(
    Object.keys(quotationListing.getMetadata()?.partner || {})[0],
  );
  const partnerServiceFee =
    Listing(order).getMetadata()?.serviceFees?.[currentPartnerId!];
  const { orderType = EOrderType.group } = Listing(order).getMetadata();
  const isGroupOrder = orderType === EOrderType.group;

  const priceQuotation = isPartner
    ? calculatePriceQuotationPartner({
        quotation:
          quotationListing.getMetadata()?.[target]?.[currentPartnerId!]
            ?.quotation,
        serviceFee: partnerServiceFee,
        currentOrderVATPercentage,
      })
    : calculatePriceQuotationInfo({
        planOrderDetail: orderDetail!,
        order,
        currentOrderVATPercentage,
      });

  const handlePartnerChange = (tab: any) => {
    setCurrentPartnerId(tab.key);
  };

  const tabItems = useMemo(
    () =>
      isPartner
        ? Object.keys(quotationDetail).map((restaurantId: string) => ({
            key: restaurantId,
            label: quotationDetail[restaurantId].name,
            childrenFn: (childProps: any) => (
              <ReviewOrderDetailsSection {...childProps} />
            ),
            childrenProps: {
              foodOrderGroupedByDate: formatQuotationToFoodTableData(
                quotationDetail,
                restaurantId,
              ),
              outsideCollapsible: true,
            },
          }))
        : [],
    [isPartner, quotationDetail],
  );

  const priceQuotationData = useMemo(() => {
    return isPartner
      ? formatPriceQuotationDataPartner({
          order,
          booker,
          company,
          priceQuotation,
          restaurantId: currentPartnerId,
          quotationDetail,
          currentOrderVATPercentage,
        })
      : formatPriceQuotationData({
          order,
          orderDetail: orderDetail!,
          company,
          booker,
          priceQuotation,
          currentOrderVATPercentage,
        });
  }, [
    currentPartnerId,
    JSON.stringify(order),
    JSON.stringify(booker),
    JSON.stringify(company),
    JSON.stringify(priceQuotation),
    JSON.stringify(quotationDetail),
    JSON.stringify(company),
    JSON.stringify(orderDetail),
  ]);

  const handleDownloadPriceQuotation = useDownloadPriceQuotation({
    orderTitle: Listing(order).getAttributes().title,
    priceQuotationData: priceQuotationData as any,
  });

  return (
    <div className={css.container}>
      <div className={css.leftCol}>
        {isPartner ? (
          <Tabs items={tabItems as any} onChange={handlePartnerChange} />
        ) : (
          <>
            <div className={css.clientTitle}>Báo giá khách hàng</div>
            <ReviewOrderDetailsSection
              outsideCollapsible
              foodOrderGroupedByDate={groupFoodOrderByDate({
                orderDetail: orderDetail!,
                isGroupOrder,
              })}
            />
          </>
        )}
      </div>
      <div className={css.rightCol}>
        <ReviewCartSection
          data={priceQuotation}
          onClickDownloadPriceQuotation={handleDownloadPriceQuotation}
          showStartPickingOrderButton={false}
          title="Thực đơn phục vụ"
          target={target}
          isAdminLayout
        />
      </div>
    </div>
  );
};

export default OrderQuotationDetail;
