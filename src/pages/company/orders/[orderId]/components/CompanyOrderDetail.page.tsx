import ReviewView from '@components/OrderDetails/ReviewView/ReviewView';
import { useDownloadPriceQuotation } from '@hooks/useDownloadPriceQuotation';
import { usePrepareOrderDetailPageData } from '@hooks/usePrepareOrderManagementData';

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
  } = usePrepareOrderDetailPageData();

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
