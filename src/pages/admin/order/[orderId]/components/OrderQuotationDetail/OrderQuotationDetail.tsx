import { useMemo, useState } from 'react';

import ReviewCartSection from '@components/OrderDetails/ReviewView/ReviewCartSection/ReviewCartSection';
import ReviewOrderDetailsSection from '@components/OrderDetails/ReviewView/ReviewOrderDetailsSection/ReviewOrderDetailsSection';
import Tabs from '@components/Tabs/Tabs';
import {
  calculatePriceQuotationInfo,
  calculatePriceQuotationPartner,
} from '@pages/company/orders/[orderId]/picking/helpers/cartInfoHelper';
import { downloadPriceQuotation } from '@pages/company/orders/[orderId]/picking/helpers/downloadPriceQuotation';
import { groupFoodOrderByDate } from '@pages/company/orders/[orderId]/picking/helpers/orderDetailHelper';
import { Listing } from '@src/utils/data';
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
  const [currentPartnerId, setCurrentPartnerId] = useState<string>(
    Object.keys(quotationListing.getMetadata()?.partner || {})[0],
  );
  const partnerServiceFee =
    Listing(order).getMetadata()?.serviceFees?.[currentPartnerId!];

  const priceQuotation = isPartner
    ? calculatePriceQuotationPartner({
        quotation:
          quotationListing.getMetadata()?.[target]?.[currentPartnerId!]
            ?.quotation,
        serviceFee: partnerServiceFee,
      })
    : calculatePriceQuotationInfo({
        planOrderDetail: orderDetail!,
        order,
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

  const onDownloadPriceQuotation = async () => {
    const priceQuotationData = isPartner
      ? formatPriceQuotationDataPartner({
          order,
          booker,
          company,
          priceQuotation,
          restaurantId: currentPartnerId,
          quotationDetail,
        })
      : formatPriceQuotationData({
          order,
          orderDetail: orderDetail!,
          company,
          booker,
          priceQuotation,
        });

    await downloadPriceQuotation(
      Listing(order).getAttributes().title,
      priceQuotationData as any,
    )();
  };

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
              })}
            />
          </>
        )}
      </div>
      <div className={css.rightCol}>
        <ReviewCartSection
          data={priceQuotation}
          onClickDownloadPriceQuotation={onDownloadPriceQuotation}
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
