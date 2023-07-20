import ReviewView from '@components/OrderDetails/ReviewView/ReviewView';
import { useAppSelector } from '@hooks/reduxHooks';
import { useDownloadPriceQuotation } from '@hooks/useDownloadPriceQuotation';
import { usePrepareOrderDetailPageData } from '@hooks/usePrepareOrderManagementData';
import { Listing } from '@src/utils/data';
import { EOrderStates } from '@src/utils/enums';
import type { TListing } from '@src/utils/types';

import TitleSection from './TitleSection';

import css from './CompanyOrderDetailPage.module.scss';

type TCompanyOrderDetailPageProps = {};

const CompanyOrderDetailPage: React.FC<TCompanyOrderDetailPageProps> = () => {
  const orderData = useAppSelector((state) => state.OrderManagement.orderData);
  const systemVATPercentage = useAppSelector(
    (state) => state.SystemAttributes.systemVATPercentage,
  );
  const { orderState, orderVATPercentage } = Listing(
    orderData as TListing,
  ).getMetadata();
  const isPickingOrder = orderState === EOrderStates.picking;

  const {
    orderTitle,
    reviewViewData,
    priceQuotationData,
    canReview,
    goToReviewPage,
  } = usePrepareOrderDetailPageData({
    VATPercentage: isPickingOrder ? systemVATPercentage : orderVATPercentage,
  });

  const handleDownloadPriceQuotation = useDownloadPriceQuotation(
    orderTitle,
    priceQuotationData,
  );

  return (
    <div className={css.root}>
      <TitleSection
        className={css.titleSection}
        orderTitle={orderTitle}
        canReview={canReview}
        goToReviewPage={goToReviewPage}
      />
      <ReviewView
        className={css.reviewInfoContainer}
        onDownloadPriceQuotation={handleDownloadPriceQuotation}
        canEditInfo={false}
        reviewViewData={reviewViewData}
      />
    </div>
  );
};

export default CompanyOrderDetailPage;
