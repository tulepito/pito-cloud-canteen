/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo, useState } from 'react';
import compact from 'lodash/compact';
import isEmpty from 'lodash/isEmpty';

import ReviewCartSection from '@components/OrderDetails/ReviewView/ReviewCartSection/ReviewCartSection';
import ReviewOrderDetailsSection from '@components/OrderDetails/ReviewView/ReviewOrderDetailsSection/ReviewOrderDetailsSection';
import Tabs from '@components/Tabs/Tabs';
import {
  calculatePriceQuotationInfoFromQuotation,
  vatPercentageBaseOnVatSetting,
} from '@helpers/order/cartInfoHelper';
import { groupFoodOrderByDateFromQuotation } from '@helpers/order/orderDetailHelper';
import { useAppSelector } from '@hooks/reduxHooks';
import { useDownloadPriceQuotation } from '@hooks/useDownloadPriceQuotation';
import { Listing } from '@src/utils/data';
import { EPartnerVATSetting } from '@src/utils/enums';
import type { TListing, TObject, TUser } from '@src/utils/types';

import {
  formatPriceQuotationData,
  formatPriceQuotationDataPartner,
  prepareSingleDateFoodTableDataFromQuotation,
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
  const quotationGetter = Listing(quotation!);
  const quotationMetadata = quotationGetter.getMetadata();

  const clientQuotation = useMemo(
    () => quotationMetadata.client || {},
    [JSON.stringify(quotationMetadata.client)],
  );
  const partnerQuotation = useMemo(
    () => quotationMetadata.partner || {},
    [JSON.stringify(quotationMetadata.partner)],
  );
  const quotationDetail = useMemo(
    () => quotationMetadata[target] || {},
    [JSON.stringify(quotationMetadata), target],
  );
  const currentOrderVATPercentage = useAppSelector(
    (state) => state.SystemAttributes.currentOrderVATPercentage,
  );
  const [currentSubOrderDate, setCrrSubOrderDate] = useState<string>(
    Object.keys(clientQuotation)[0],
  );
  const {
    serviceFees = {},
    vatSettings = {},
    packagePerMember = 0,
    hasSpecificPCCFee = false,
    specificPCCFee = 0,
  } = Listing(order).getMetadata();
  const { title: orderTitle = '' } = Listing(order).getAttributes();

  const currentPartnerId = (Object.entries(partnerQuotation).find(
    ([, value]) => (value as TObject)?.quotation[currentSubOrderDate],
  ) || [])[0];
  const partnerVATSetting =
    vatSettings?.[currentPartnerId!] || EPartnerVATSetting.vat;
  const partnerServiceFee = serviceFees[currentPartnerId!] || 0;
  const vatPercentage = isPartner
    ? vatPercentageBaseOnVatSetting({
        vatSetting: partnerVATSetting,
        vatPercentage: currentOrderVATPercentage,
      })
    : currentOrderVATPercentage;

  const priceQuotation = useMemo(
    () =>
      calculatePriceQuotationInfoFromQuotation({
        quotation: quotation!,
        packagePerMember,
        currentOrderVATPercentage: vatPercentage,
        date: isPartner ? currentSubOrderDate : undefined,
        partnerId: currentPartnerId,
        currentOrderServiceFeePercentage: partnerServiceFee / 100,
        shouldSkipVAT: partnerVATSetting === EPartnerVATSetting.direct,
        hasSpecificPCCFee,
        specificPCCFee,
      }),
    [
      isPartner,
      hasSpecificPCCFee,
      specificPCCFee,
      partnerServiceFee,
      partnerVATSetting,
      vatPercentage,
      JSON.stringify(quotation),
      currentSubOrderDate,
    ],
  );

  const handleTabChange = (tab: any) => {
    setCrrSubOrderDate(tab.key);
  };

  const tabItems = useMemo(() => {
    if (isPartner) {
      const partnerQuotationEntries = Object.entries(quotationDetail);

      return compact(
        Object.keys(clientQuotation.quotation).reduce(
          (res: any[], subOrderDate: string) => {
            const partnerEntry = partnerQuotationEntries.find(
              ([_, value]) =>
                !isEmpty((value as TObject)?.quotation[subOrderDate]),
            );
            if (isEmpty(partnerEntry)) {
              return res;
            }

            const [partnerId] = partnerEntry!;
            const dayIndex = new Date(Number(subOrderDate)).getDay();

            return res.concat({
              key: subOrderDate,
              label: `${quotationDetail[partnerId].name} #${orderTitle}-${dayIndex}`,
              childrenFn: (childProps: any) => (
                <ReviewOrderDetailsSection {...childProps} />
              ),
              childrenProps: {
                foodOrderGroupedByDate:
                  prepareSingleDateFoodTableDataFromQuotation(
                    clientQuotation.quotation,
                    subOrderDate,
                  ),
                outsideCollapsible: true,
              },
            });
          },
          [],
        ),
      );
    }

    return [];
  }, [isPartner, quotationDetail]);

  const priceQuotationData = useMemo(() => {
    return isPartner
      ? formatPriceQuotationDataPartner({
          order,
          booker,
          company,
          priceQuotation,
          restaurantId: currentPartnerId!,
          quotationDetail,
          vatPercentage,
        })
      : formatPriceQuotationData({
          order,
          company,
          booker,
          priceQuotation,
          currentOrderVATPercentage,
          quotation,
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
    isPartnerQuotation: isPartner,
    subOrderDate: isPartner ? currentSubOrderDate : undefined,
    vatSetting: partnerVATSetting,
  });

  return (
    <div className={css.container}>
      <div className={css.leftCol}>
        {isPartner ? (
          <Tabs
            items={tabItems as any}
            onChange={handleTabChange}
            defaultActiveKey="1"
            tabItemClassName={css.tabItem}
            tabActiveItemClassName={css.tabActiveItem}
          />
        ) : (
          <>
            <div className={css.clientTitle}>Báo giá khách hàng</div>
            <ReviewOrderDetailsSection
              outsideCollapsible
              foodOrderGroupedByDate={groupFoodOrderByDateFromQuotation({
                quotation: quotation!,
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
          vatSetting={isPartner ? partnerVATSetting : undefined}
        />
      </div>
    </div>
  );
};

export default OrderQuotationDetail;
