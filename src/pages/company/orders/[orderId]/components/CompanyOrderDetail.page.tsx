import BookerOrderDetailReviewView from '@pages/orders/[orderId]/components/BookerOrderDetailsReviewView/BookerOrderDetailsReviewView/BookerOrderDetailReviewView';
import { downloadPriceQuotation } from '@pages/orders/[orderId]/helpers/downloadPriceQuotation';
import { usePrepareOrderDetailPageData } from '@pages/orders/[orderId]/hooks/usePrepareData';

import css from './CompanyOrderDetailPage.module.scss';
import TitleSection from './TitleSection';

type TCompanyOrderDetailPageProps = {};

const CompanyOrderDetailPage: React.FC<TCompanyOrderDetailPageProps> = () => {
  const { orderTitle, reviewViewData, priceQuotationData } =
    usePrepareOrderDetailPageData();

  return (
    <div className={css.root}>
      <TitleSection className={css.titleSection} orderTitle={orderTitle} />
      <BookerOrderDetailReviewView
        className={css.reviewInfoContainer}
        onDownloadPriceQuotation={downloadPriceQuotation(priceQuotationData)}
        canEditInfo={false}
        reviewViewData={reviewViewData}
      />
    </div>
  );
};

export default CompanyOrderDetailPage;
