import classNames from 'classnames';

import RenderWhen from '@components/RenderWhen/RenderWhen';
import type { usePrepareOrderDetailPageData } from '@pages/company/orders/[orderId]/picking/hooks/usePrepareData';
import type { TDefaultProps } from '@utils/types';

import ReviewCartSection from './ReviewCartSection/ReviewCartSection';
import type { TReviewInfoFormValues } from './ReviewInfoSection/ReviewInfoForm';
import ReviewInfoSection from './ReviewInfoSection/ReviewInfoSection';
import ReviewOrderDetailsSection from './ReviewOrderDetailsSection/ReviewOrderDetailsSection';
import ReviewOrderProcessSection from './ReviewOrderProcessSection/ReviewOrderProcessSection';
import ReviewOrdersResultSection from './ReviewOrdersResultSection/ReviewOrdersResultSection';
import ReviewOrderStatesSection from './ReviewOrderStatesSection/ReviewOrderStatesSection';
import ReviewTitleSection from './ReviewTitleSection/ReviewTitleSection';

import css from './ReviewView.module.scss';

type TReviewViewProps = TDefaultProps & {
  canEditInfo?: boolean;
  canGoBackEditMode?: boolean;
  showStartPickingOrderButton?: boolean;
  isAdminLayout?: boolean;
  reviewViewData: ReturnType<
    typeof usePrepareOrderDetailPageData
  >['reviewViewData'];
  onGoBackToEditOrderPage?: () => void;
  onSubmitEdit?: (values: TReviewInfoFormValues) => void;
  onDownloadPriceQuotation: () => Promise<void>;
};

const ReviewView: React.FC<TReviewViewProps> = (props) => {
  const {
    className,
    rootClassName,
    canEditInfo = true,
    canGoBackEditMode = false,
    isAdminLayout = false,
    showStartPickingOrderButton = false,
    reviewViewData,
    onGoBackToEditOrderPage,
    onSubmitEdit,
    onDownloadPriceQuotation,
    classes = {},
  } = props;
  const { leftClassName, rightClassName } = classes;

  const isGroupOrder = reviewViewData?.isGroupOrder;
  const rootClasses = classNames(rootClassName || css.root, className);
  const leftPartClasses = classNames(css.leftPart, leftClassName);
  const rightPartClasses = classNames(css.rightPart, rightClassName);

  return (
    <div className={rootClasses}>
      {canGoBackEditMode && onGoBackToEditOrderPage && (
        <ReviewTitleSection
          className={css.titlePart}
          orderTitle={reviewViewData?.orderTitle}
          onGoBack={onGoBackToEditOrderPage}
        />
      )}
      <div className={leftPartClasses}>
        <RenderWhen condition={!canGoBackEditMode}>
          <ReviewOrderStatesSection
            data={{
              transactionDataMap: reviewViewData?.transactionDataMap || {},
              isCanceledOrder: reviewViewData?.isCanceledOrder || false,
            }}
          />
        </RenderWhen>

        <ReviewInfoSection
          startSubmitReviewInfoForm
          canEdit={canEditInfo}
          className={css.infoRoot}
          data={reviewViewData?.reviewInfoData || {}}
          onSubmit={onSubmitEdit}
        />

        <RenderWhen condition={isGroupOrder}>
          <ReviewOrdersResultSection
            className={css.resultRoot}
            data={reviewViewData.reviewResultData}
            goBackToEditMode={onGoBackToEditOrderPage}
          />
        </RenderWhen>

        <ReviewOrderDetailsSection
          className={css.detailRoot}
          foodOrderGroupedByDate={reviewViewData.foodOrderGroupedByDate}
        />
      </div>
      <div className={rightPartClasses}>
        <RenderWhen condition={!canGoBackEditMode}>
          <ReviewOrderProcessSection />
        </RenderWhen>
        <ReviewCartSection
          data={reviewViewData.reviewCartData}
          showStartPickingOrderButton={showStartPickingOrderButton}
          onClickDownloadPriceQuotation={onDownloadPriceQuotation}
          foodOrderGroupedByDate={reviewViewData.foodOrderGroupedByDate}
          target="client"
          isAdminLayout={isAdminLayout}
        />
      </div>
    </div>
  );
};

export default ReviewView;
