import { useEffect } from 'react';
import classNames from 'classnames';

import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppDispatch } from '@hooks/reduxHooks';
import type { usePrepareOrderDetailPageData } from '@pages/company/orders/[orderId]/picking/hooks/usePrepareData';
import { orderManagementThunks } from '@redux/slices/OrderManagement.slice';
import { Listing } from '@src/utils/data';
import type { TDefaultProps, TListing } from '@utils/types';

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
  reviewViewData: ReturnType<
    typeof usePrepareOrderDetailPageData
  >['reviewViewData'];
  orderData: TListing;
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
    showStartPickingOrderButton = false,
    reviewViewData,
    onGoBackToEditOrderPage,
    onSubmitEdit,
    onDownloadPriceQuotation,
    orderData,
  } = props;
  const dispatch = useAppDispatch();
  const orderListingGetter = Listing(orderData);
  const { quotationId } = orderListingGetter.getMetadata();
  useEffect(() => {
    if (quotationId) {
      dispatch(orderManagementThunks.fetchQuotation(quotationId));
    }
  }, [dispatch, quotationId]);

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
          data={reviewViewData.reviewCartData}
          showStartPickingOrderButton={showStartPickingOrderButton}
          onClickDownloadPriceQuotation={onDownloadPriceQuotation}
          foodOrderGroupedByDate={reviewViewData.foodOrderGroupedByDate}
          target="client"
        />
      </div>
    </div>
  );
};

export default ReviewView;
