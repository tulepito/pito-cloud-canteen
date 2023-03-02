import BookerOrderDetailReviewView from '../picking/components/BookerOrderDetailsReviewView/BookerOrderDetailsReviewView/BookerOrderDetailReviewView';
import { downloadPriceQuotation } from '../picking/helpers/downloadPriceQuotation';
import { usePrepareOrderDetailPageData } from '../picking/hooks/usePrepareData';
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
