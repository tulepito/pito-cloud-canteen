import classNames from 'classnames';

import RenderWhen from '@components/RenderWhen/RenderWhen';
import type { TDefaultProps } from '@utils/types';

import type { usePrepareOrderDetailPageData } from '../../../hooks/usePrepareData';
import ReviewCartSection from '../ReviewCartSection/ReviewCartSection';
import type { TReviewInfoFormValues } from '../ReviewInfoSection/ReviewInfoForm';
import ReviewInfoSection from '../ReviewInfoSection/ReviewInfoSection';
import ReviewOrderDetailsSection from '../ReviewOrderDetailsSection/ReviewOrderDetailsSection';
import ReviewOrderProcessSection from '../ReviewOrderProcessSection/ReviewOrderProcessSection';
import ReviewOrdersResultSection from '../ReviewOrdersResultSection/ReviewOrdersResultSection';
import ReviewOrderStatesSection from '../ReviewOrderStatesSection/ReviewOrderStatesSection';
import ReviewTitleSection from '../ReviewTitleSection/ReviewTitleSection';

import css from './BookerOrderDetailReviewView.module.scss';

type TBookerOrderDetailReviewViewProps = TDefaultProps & {
  canEditInfo?: boolean;
  canGoBackEditMode?: boolean;
  showStartPickingOrderButton?: boolean;
  reviewViewData: ReturnType<
    typeof usePrepareOrderDetailPageData
  >['reviewViewData'];
  onGoBackToEditOrderPage?: () => void;
  onSubmitEdit?: (values: TReviewInfoFormValues) => void;
  onDownloadPriceQuotation: () => Promise<void>;
};

const BookerOrderDetailReviewView: React.FC<
  TBookerOrderDetailReviewViewProps
> = (props) => {
  const {
    className,
    rootClassName,
    canEditInfo = true,
    canGoBackEditMode = false,
    showStartPickingOrderButton = false,
    reviewViewData,
    onGoBackToEditOrderPage,
    onSubmitEdit,
    onDownloadPriceQuotation,
  } = props;

  const rootClasses = classNames(rootClassName || css.root, className);

  return (
    <div className={rootClasses}>
      {canGoBackEditMode && onGoBackToEditOrderPage && (
        <ReviewTitleSection
          className={css.titlePart}
          orderTitle={reviewViewData?.orderTitle}
          onGoBack={onGoBackToEditOrderPage}
        />
      )}
      <div className={css.leftPart}>
        <RenderWhen condition={!canGoBackEditMode}>
          <ReviewOrderStatesSection data={reviewViewData.transactionDataMap} />
        </RenderWhen>

        <ReviewInfoSection
          startSubmitReviewInfoForm
          canEdit={canEditInfo}
          className={css.infoRoot}
          data={reviewViewData?.reviewInfoData || {}}
          onSubmit={onSubmitEdit}
        />
        <ReviewOrdersResultSection
          className={css.resultRoot}
          data={reviewViewData.reviewResultData}
          goBackToEditMode={onGoBackToEditOrderPage}
        />
        <ReviewOrderDetailsSection
          className={css.detailRoot}
          foodOrderGroupedByDate={reviewViewData.foodOrderGroupedByDate}
        />
      </div>
      <div className={css.rightPart}>
        <RenderWhen condition={!canGoBackEditMode}>
          <ReviewOrderProcessSection />
        </RenderWhen>
        <ReviewCartSection
          className={css.cartRoot}
          data={reviewViewData.reviewCartData}
          showStartPickingOrderButton={showStartPickingOrderButton}
          onClickDownloadPriceQuotation={onDownloadPriceQuotation}
        />
      </div>
    </div>
  );
};

export default BookerOrderDetailReviewView;
