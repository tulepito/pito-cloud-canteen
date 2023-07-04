import ReviewView from '@components/OrderDetails/ReviewView/ReviewView';
import { useDownloadPriceQuotation } from '@hooks/useDownloadPriceQuotation';
import useExportOrderDetails from '@hooks/useExportOrderDetails';
import { usePrepareOrderDetailPageData } from '@hooks/usePrepareOrderManagementData';
import type { TListing } from '@src/utils/types';

import TitleSection from './TitleSection';

import css from './CompanyOrderDetailPage.module.scss';

type TCompanyOrderDetailPageProps = {};

const CompanyOrderDetailPage: React.FC<TCompanyOrderDetailPageProps> = () => {
  const {
    orderTitle,
    reviewViewData,
    priceQuotationData,
    canReview,
    goToReviewPage,
    orderData,
  } = usePrepareOrderDetailPageData();

  const handleDownloadPriceQuotation = useDownloadPriceQuotation(
    orderTitle,
    priceQuotationData,
  );

  const { handler: onDownloadReviewOrderResults } = useExportOrderDetails();

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
        orderData={orderData as TListing}
        onDownloadReviewOrderResults={onDownloadReviewOrderResults}
      />
    </div>
  );
};

export default CompanyOrderDetailPage;
