import ReviewView from '@components/OrderDetails/ReviewView/ReviewView';

import { downloadPriceQuotation } from '../picking/helpers/downloadPriceQuotation';
import { usePrepareOrderDetailPageData } from '../picking/hooks/usePrepareData';

import TitleSection from './TitleSection';

import css from './CompanyOrderDetailPage.module.scss';

type TCompanyOrderDetailPageProps = {};

const CompanyOrderDetailPage: React.FC<TCompanyOrderDetailPageProps> = () => {
  const { orderTitle, reviewViewData, priceQuotationData } =
    usePrepareOrderDetailPageData();

  return (
    <div className={css.root}>
      <TitleSection className={css.titleSection} orderTitle={orderTitle} />
      <ReviewView
        className={css.reviewInfoContainer}
        onDownloadPriceQuotation={downloadPriceQuotation(priceQuotationData)}
        canEditInfo={false}
        reviewViewData={reviewViewData}
      />
    </div>
  );
};

export default CompanyOrderDetailPage;
