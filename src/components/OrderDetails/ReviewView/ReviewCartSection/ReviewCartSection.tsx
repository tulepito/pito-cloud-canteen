import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import { useRouter } from 'next/router';

import Badge from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import MobileBottomContainer from '@components/MobileBottomContainer/MobileBottomContainer';
import PriceQuotation from '@components/OrderDetails/PriceQuotation/PriceQuotation';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import SlideModal from '@components/SlideModal/SlideModal';
import { parseThousandNumber } from '@helpers/format';
import { isEnableToStartOrder } from '@helpers/orderHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import type { usePrepareOrderDetailPageData } from '@hooks/usePrepareOrderManagementData';
import { useViewport } from '@hooks/useViewport';
import { orderManagementThunks } from '@redux/slices/OrderManagement.slice';
import { companyPaths } from '@src/paths';
import { EOrderStates, EOrderType, EPartnerVATSetting } from '@src/utils/enums';
import { Listing } from '@utils/data';
import type { TListing, TObject } from '@utils/types';

import type { TReviewInfoFormValues } from '../ReviewInfoSection/ReviewInfoForm';

import css from './ReviewCartSection.module.scss';

type TReviewCartSectionProps = {
  className?: string;
  data: TObject;
  priceQuotationData?: ReturnType<
    typeof usePrepareOrderDetailPageData
  >['priceQuotationData'];
  reviewInfoValues?: TReviewInfoFormValues;
  showStartPickingOrderButton: boolean;
  isViewCartDetailMode?: boolean;
  shouldShowGoHomeButton?: boolean;
  showGoHomeButton?: boolean;
  onViewCartDetail?: () => void;
  onClickDownloadPriceQuotation: () => void;
  foodOrderGroupedByDate?: TObject[];
  title?: string;
  target: 'client' | 'partner';
  isAdminLayout?: boolean;
  vatSetting?: EPartnerVATSetting;
  goToReviewPage?: () => void;
  canReview?: boolean;
};

const ReviewCartSection: React.FC<TReviewCartSectionProps> = (props) => {
  const {
    className,
    data: {
      overflow = 0,
      serviceFee = 0,
      serviceFeePercentage = 0,
      totalPrice = 0,
      totalWithoutVAT = 0,
      totalWithVAT = 0,
      VATFee = 0,
      PITOFee = 0,
      vatPercentage = 0,
    } = {},
    priceQuotationData,
    showStartPickingOrderButton,
    // showGoHomeButton = false,
    reviewInfoValues = {},
    onClickDownloadPriceQuotation,
    foodOrderGroupedByDate,
    title,
    target,
    isAdminLayout = false,
    isViewCartDetailMode = false,
    onViewCartDetail = () => {},
    vatSetting = EPartnerVATSetting.vat,
    shouldShowGoHomeButton = false,
    goToReviewPage,
    canReview,
  } = props;
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isMobileLayout } = useViewport();
  const previewPriceQuotationControl = useBoolean();
  const isDownloadingPriceQuotation = useAppSelector(
    (state) => state.priceQuotation.isDownloading,
  );
  const isStartOrderInProgress = useAppSelector(
    (state) => state.OrderManagement.isStartOrderInProgress,
  );
  const updateOrderFromDraftEditInProgress = useAppSelector(
    (state) => state.OrderManagement.updateOrderFromDraftEditInProgress,
  );
  const planData = useAppSelector((state) => state.OrderManagement.planData);
  const orderData = useAppSelector((state) => state.OrderManagement.orderData);

  const {
    query: { orderId },
  } = router;
  const rootClasses = classNames(
    css.root,
    { [css.isViewCartDetailMode]: isViewCartDetailMode },
    className,
  );
  const titleClasses = classNames(css.title, {
    [css.adminTitle]: isAdminLayout,
    [css.hideTitle]: isViewCartDetailMode,
  });
  const downloadPriceQuotationClasses = classNames(css.downloadPriceQuotation, {
    [css.downloadingPriceQuotation]: isDownloadingPriceQuotation,
  });
  const shouldShowVATCondition =
    (vatSetting !== EPartnerVATSetting.direct && target === 'partner') ||
    target === 'client';
  const { orderDetail } = Listing(planData as TListing).getMetadata();
  const { orderType = EOrderType.group, orderState } = Listing(
    orderData as TListing,
  ).getMetadata();
  const {
    invalid = false,
    contactPeopleName,
    contactPhoneNumber,
  } = reviewInfoValues as TObject;
  const isStartOrderDisabled =
    invalid ||
    !isEnableToStartOrder(
      orderDetail,
      orderType === EOrderType.group,
      isAdminLayout,
    );

  const isDraftEditing = orderState === EOrderStates.inProgress;

  const isPartner = target === 'partner';

  const handleStartPickingOrder = async () => {
    await dispatch(
      orderManagementThunks.updateOrderGeneralInfo({
        contactPeopleName,
        contactPhoneNumber,
        skipFetchData: true,
      }),
    );

    let response;
    if (isDraftEditing) {
      response = await dispatch(
        orderManagementThunks.updateOrderFromDraftEdit(foodOrderGroupedByDate!),
      );
    } else {
      response = await dispatch(
        orderManagementThunks.bookerStartOrder({
          orderId: orderId as string,
          foodOrderGroupedByDate,
        }),
      );
    }

    if (response.meta.requestStatus !== 'rejected') {
      if (isAdminLayout) {
        router.reload();
      } else {
        router.push({
          pathname: companyPaths.ManageOrderDetail,
          query: { orderId },
        });
      }
    }
  };

  const handleGoHome = () => {
    router.push(companyPaths.Home);
  };

  const handleDownloadPriceQuotationClick = () => {
    if (isViewCartDetailMode) {
      previewPriceQuotationControl.setTrue();
    } else {
      onClickDownloadPriceQuotation();
    }
  };

  const handleDownloadPriceQuotationAndCloseModal = () => {
    previewPriceQuotationControl.setFalse();
    onClickDownloadPriceQuotation();
  };

  const contactNumber = (
    <span className={css.contactNumber}>
      {intl.formatMessage({
        id: 'CompanyOrderDetailPage.titleSection.contactNumber',
      })}
    </span>
  );
  const chatLink = (
    <span className={css.chatLink}>
      {intl.formatMessage({
        id: 'CompanyOrderDetailPage.titleSection.chatLinkText',
      })}
    </span>
  );

  const reviewText = intl.formatMessage(
    {
      id: 'CompanyOrderDetailPage.titleSection.reviewButtonText',
    },
    { contactNumber, chatLink },
  );

  const bottomActionSection = (
    <>
      <RenderWhen condition={showStartPickingOrderButton}>
        <Button
          variant="cta"
          className={css.makePaymentButton}
          inProgress={
            isStartOrderInProgress || updateOrderFromDraftEditInProgress
          }
          disabled={isStartOrderDisabled || updateOrderFromDraftEditInProgress}
          onClick={handleStartPickingOrder}>
          <div>
            {intl.formatMessage({
              id: 'ReviewCardSection.makePayment',
            })}
          </div>
        </Button>
      </RenderWhen>
      <div className={css.row}>
        <RenderWhen condition={shouldShowGoHomeButton && !isViewCartDetailMode}>
          <Button
            className={css.goHomeButton}
            variant={isMobileLayout ? 'secondary' : 'primary'}
            onClick={handleGoHome}>
            <div>{isMobileLayout ? 'Trang chủ' : 'Về trang chủ'}</div>
          </Button>
        </RenderWhen>
        <RenderWhen condition={canReview}>
          <Button
            variant="primary"
            className={css.reviewButton}
            onClick={goToReviewPage}>
            {reviewText}
          </Button>
        </RenderWhen>
      </div>

      <RenderWhen condition={overflow > 0}>
        <div className={css.overflowPackageInfo}>
          {intl.formatMessage(
            {
              id: 'ReviewCardSection.overflowPackage',
            },
            {
              overflow: parseThousandNumber(overflow),
            },
          )}
        </div>
      </RenderWhen>
    </>
  );

  const feeSection = (
    <div className={css.feeContainer}>
      <div className={css.feeItem}>
        <div className={css.feeItemContainer}>
          <div className={css.label}>
            {intl.formatMessage({ id: 'ReviewCardSection.totalPrice' })}
          </div>
          <div className={css.fee}>{parseThousandNumber(totalPrice)}đ</div>
        </div>
      </div>
      {isPartner && (
        <div className={css.feeItem}>
          <div className={css.feeItemContainer}>
            <div className={css.label}>
              {intl.formatMessage({ id: 'ReviewCardSection.serviceFee' })}
              <Badge
                label={`${serviceFeePercentage}%`}
                className={css.VATBadge}
              />
            </div>
            <div className={css.fee}>{parseThousandNumber(serviceFee)}đ</div>
          </div>
        </div>
      )}
      {!isPartner && (
        <div className={css.feeItem}>
          <div className={css.feeItemContainer}>
            <div className={css.label}>
              {intl.formatMessage({ id: 'ReviewCardSection.PITOFee' })}
            </div>
            <div className={css.fee}>{parseThousandNumber(PITOFee)}đ</div>
          </div>
        </div>
      )}
      <div className={css.feeItem}>
        <div className={css.feeItemContainer}>
          <div className={css.totalWithoutVATLabel}>
            {intl.formatMessage({ id: 'ReviewCardSection.totalWithoutVAT' })}
          </div>

          <div className={css.fee}>{parseThousandNumber(totalWithoutVAT)}đ</div>
        </div>
      </div>
      <RenderWhen condition={shouldShowVATCondition}>
        <div className={css.feeItem}>
          <div
            className={classNames(css.feeItemContainer, css.VATItemContainer)}>
            <div className={css.label}>
              <RenderWhen condition={vatSetting === EPartnerVATSetting.vat}>
                {intl.formatMessage({ id: 'ReviewCardSection.VAT' })}
                <RenderWhen.False>
                  {intl.formatMessage({
                    id: 'ReviewCardSection.noExportVAT',
                  })}
                </RenderWhen.False>
              </RenderWhen>
              <Badge
                label={`${vatPercentage * 100}%`}
                className={css.VATBadge}
              />
            </div>
            <div className={css.fee}>{parseThousandNumber(VATFee)}đ</div>
          </div>
        </div>
      </RenderWhen>
      <div className={css.feeItem}>
        <div className={css.totalWithVATLabel}>
          {intl.formatMessage({ id: 'ReviewCardSection.totalWithVAT' })}
        </div>
        <div className={css.totalWithVAT}>
          {parseThousandNumber(totalWithVAT)}đ
        </div>
        <div className={css.totalDescription}>
          {intl.formatMessage({ id: 'ReviewCardSection.totalDescription' })}
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    if (!isViewCartDetailMode) {
      previewPriceQuotationControl.setFalse();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isViewCartDetailMode]);

  return (
    <div className={rootClasses}>
      <RenderWhen condition={!isMobileLayout || isViewCartDetailMode}>
        <div className={titleClasses}>
          {title || intl.formatMessage({ id: 'ReviewCardSection.title' })}
        </div>
        {feeSection}
        <Button
          variant="inline"
          className={downloadPriceQuotationClasses}
          disabled={isDownloadingPriceQuotation}
          onClick={handleDownloadPriceQuotationClick}>
          {intl.formatMessage({
            id: 'ReviewCardSection.downloadPriceQuotation',
          })}
        </Button>
        {bottomActionSection}
      </RenderWhen>

      <RenderWhen condition={!isViewCartDetailMode}>
        <MobileBottomContainer className={css.mobileBottomContainer}>
          <div className={css.mobileBottomContentContainer}>
            <div className={css.totalInfo}>
              <span>TỔNG TIỀN</span>
              <span className={css.totalWithVAT}>
                {parseThousandNumber(totalWithVAT)}đ
              </span>
            </div>
            <div className={css.viewCartDetail} onClick={onViewCartDetail}>
              <span>Xem chi tiết giỏ hàng</span>
              <IconArrow direction="right" />
            </div>
            {bottomActionSection}
          </div>
        </MobileBottomContainer>
      </RenderWhen>

      {previewPriceQuotationControl.value && isViewCartDetailMode && (
        <SlideModal
          id="ReviewCartSection.previewPriceQuotation"
          isOpen={previewPriceQuotationControl.value}
          onClose={previewPriceQuotationControl.setFalse}
          modalTitle="Báo giá"
          className={css.priceQuotationModal}
          openClassName={css.priceQuotationModalOpen}
          containerClassName={css.priceQuotationModalContainer}
          shouldShowOverlay>
          <div className={css.scrollContainer}>
            <div className={css.topBorder} />
            <PriceQuotation
              shouldResponsive
              className={css.priceQuotation}
              data={priceQuotationData as any}
            />
          </div>
          <Button
            onClick={handleDownloadPriceQuotationAndCloseModal}
            className={css.downloadPriceQuotationButton}
            disabled={isDownloadingPriceQuotation}>
            Tải báo giá
          </Button>
        </SlideModal>
      )}
    </div>
  );
};

export default ReviewCartSection;
