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
import ReviewNoteSection from './ReviewNoteSection/ReviewNoteSection';
import ReviewOrderDetailsSection from './ReviewOrderDetailsSection/ReviewOrderDetailsSection';
import ReviewOrderProcessSection from './ReviewOrderProcessSection/ReviewOrderProcessSection';
import ReviewOrdersResultSection from './ReviewOrdersResultSection/ReviewOrdersResultSection';
import ReviewOrderStatesSection from './ReviewOrderStatesSection/ReviewOrderStatesSection';
import ReviewTitleSection from './ReviewTitleSection/ReviewTitleSection';

import css from './ReviewView.module.scss';

type TReviewViewProps = TDefaultProps & {
  canEditInfo?: boolean;
  canGoBackEditMode?: boolean;
  isViewCartDetailMode?: boolean;
  showStartPickingOrderButton?: boolean;
  shouldShowGoHomeButtonOnMobileCart?: boolean;
  isAdminLayout?: boolean;
  reviewViewData: ReturnType<
    typeof usePrepareOrderDetailPageData
  >['reviewViewData'];
  priceQuotationData?: ReturnType<
    typeof usePrepareOrderDetailPageData
  >['priceQuotationData'];
  orderData?: TListing;
  reviewInfoValues?: TReviewInfoFormValues;
  setInfoFormValues?: (values: TReviewInfoFormValues, invalid: any) => void;

  onGoBackToEditOrderPage?: () => void;
  onDownloadPriceQuotation: () => Promise<void>;
  onSaveOrderNote?: (value: string) => void;
  onDownloadReviewOrderResults: () => void;
  onViewCartDetail?: () => void;
};

const ReviewView: React.FC<TReviewViewProps> = (props) => {
  const {
    className,
    rootClassName,
    canEditInfo = true,
    canGoBackEditMode = false,
    isViewCartDetailMode = false,
    isAdminLayout = false,
    showStartPickingOrderButton = false,
    reviewViewData,
    priceQuotationData = {},
    onGoBackToEditOrderPage,
    onDownloadPriceQuotation,
    classes = {},
    onSaveOrderNote,
    onViewCartDetail,
    onDownloadReviewOrderResults,
    orderData,
    reviewInfoValues,
    setInfoFormValues,
    shouldShowGoHomeButtonOnMobileCart = false,
  } = props;
  const dispatch = useAppDispatch();
  const { leftClassName, rightClassName } = classes;

  const { quotationId } = Listing(orderData!).getMetadata();

  const isGroupOrder = reviewViewData?.isGroupOrder;
  const rootClasses = classNames(rootClassName || css.root, className);
  const leftPartClasses = classNames(css.leftPart, leftClassName);
  const rightPartClasses = classNames(css.rightPart, rightClassName);

  useEffect(() => {
    if (quotationId) {
      dispatch(orderManagementThunks.fetchQuotation(quotationId));
    }
  }, [dispatch, quotationId]);

  return (
    <div className={rootClasses}>
      <RenderWhen condition={!isViewCartDetailMode}>
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
                orderDetail: reviewViewData?.reviewResultData?.orderDetail,
                isCanceledOrder: reviewViewData?.isCanceledOrder || false,
              }}
            />
          </RenderWhen>

          <ReviewInfoSection
            canEdit={canEditInfo}
            data={reviewViewData?.reviewInfoData || {}}
            setFormValues={setInfoFormValues}
          />
          <RenderWhen condition={isGroupOrder}>
            <ReviewOrdersResultSection
              className={css.resultRoot}
              data={reviewViewData.reviewResultData}
              onDownloadReviewOrderResults={onDownloadReviewOrderResults}
            />
          </RenderWhen>

          <ReviewOrderDetailsSection
            foodOrderGroupedByDate={reviewViewData.foodOrderGroupedByDate}
          />
          {isGroupOrder && (
            <ReviewNoteSection
              onSaveOrderNote={onSaveOrderNote}
              data={reviewViewData.orderNoteData}
            />
          )}
        </div>
      </RenderWhen>
      <div className={rightPartClasses}>
        <RenderWhen condition={!canGoBackEditMode}>
          <ReviewOrderProcessSection />
        </RenderWhen>
        <ReviewCartSection
          data={reviewViewData.reviewCartData}
          priceQuotationData={priceQuotationData}
          showStartPickingOrderButton={showStartPickingOrderButton}
          onClickDownloadPriceQuotation={onDownloadPriceQuotation}
          foodOrderGroupedByDate={reviewViewData.foodOrderGroupedByDate}
          target="client"
          isAdminLayout={isAdminLayout}
          isViewCartDetailMode={isViewCartDetailMode}
          onViewCartDetail={onViewCartDetail}
          reviewInfoValues={reviewInfoValues}
          shouldShowGoHomeButton={shouldShowGoHomeButtonOnMobileCart}
        />
      </div>
    </div>
  );
};

export default ReviewView;
