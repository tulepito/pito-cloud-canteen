import { useState } from 'react';

import MobileTopContainer from '@components/MobileTopContainer/MobileTopContainer';
import ReviewView from '@components/OrderDetails/ReviewView/ReviewView';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppSelector } from '@hooks/reduxHooks';
import { useDownloadPriceQuotation } from '@hooks/useDownloadPriceQuotation';
import useExportOrderDetails from '@hooks/useExportOrderDetails';
import { usePrepareOrderDetailPageData } from '@hooks/usePrepareOrderManagementData';
import { Listing } from '@src/utils/data';
import { EOrderStates } from '@src/utils/enums';
import type { TListing } from '@src/utils/types';

import TitleSection from './TitleSection';

import css from './CompanyOrderDetailPage.module.scss';

type TCompanyOrderDetailPageProps = {};

enum EPageViewMode {
  review = 'review',
  cartDetail = 'cartDetail',
}

const CompanyOrderDetailPage: React.FC<TCompanyOrderDetailPageProps> = () => {
  const [viewMode, setViewMode] = useState<EPageViewMode>(EPageViewMode.review);
  const isViewCartDetailMode = viewMode === EPageViewMode.cartDetail;

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

  const handleDownloadPriceQuotation = useDownloadPriceQuotation({
    orderTitle,
    priceQuotationData,
  });

  const { handler: onDownloadReviewOrderResults } = useExportOrderDetails();

  const handleGoBackFromViewCartDetailMode = () => {
    setViewMode(EPageViewMode.review);
  };
  const handleViewCartDetail = () => {
    setViewMode(EPageViewMode.cartDetail);
  };

  const mobileTopContainerProps = {
    title: isViewCartDetailMode ? 'Giỏ hàng của bạn' : 'Chi tiết đơn hàng',
    hasGoBackButton: isViewCartDetailMode,
    onGoBack: isViewCartDetailMode
      ? handleGoBackFromViewCartDetailMode
      : undefined,
  };

  return (
    <>
      <MobileTopContainer {...mobileTopContainerProps} />
      <div className={css.root}>
        <RenderWhen condition={!isViewCartDetailMode}>
          <TitleSection
            className={css.titleSection}
            orderTitle={orderTitle}
            canReview={canReview}
            goToReviewPage={goToReviewPage}
          />
        </RenderWhen>
        <ReviewView
          className={css.reviewInfoContainer}
          onDownloadPriceQuotation={handleDownloadPriceQuotation}
          canEditInfo={false}
          reviewViewData={reviewViewData}
          onDownloadReviewOrderResults={onDownloadReviewOrderResults}
          orderData={orderData as TListing}
          priceQuotationData={priceQuotationData}
          isViewCartDetailMode={isViewCartDetailMode}
          onViewCartDetail={handleViewCartDetail}
          shouldShowGoHomeButtonOnMobileCart
        />
      </div>
    </>
  );
};

export default CompanyOrderDetailPage;
