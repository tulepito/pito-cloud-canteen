import React from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import { useRouter } from 'next/router';

import Badge from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { parseThousandNumber } from '@helpers/format';
import { isEnableToStartOrder } from '@helpers/orderHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { orderManagementThunks } from '@redux/slices/OrderManagement.slice';
import { companyPaths } from '@src/paths';
import { EOrderStates, EOrderType } from '@src/utils/enums';
import { Listing } from '@utils/data';
import type { TListing, TObject } from '@utils/types';

import css from './ReviewCartSection.module.scss';

type TReviewCartSectionProps = {
  className?: string;
  data: TObject;
  showStartPickingOrderButton: boolean;
  onClickDownloadPriceQuotation: () => void;
  foodOrderGroupedByDate?: TObject[];
  title?: string;
  target: 'client' | 'partner';
  isAdminLayout?: boolean;
};

const ReviewCartSection: React.FC<TReviewCartSectionProps> = (props) => {
  const {
    className,
    data: {
      overflow = 0,
      promotion = 0,
      serviceFee = 0,
      serviceFeePrice = 0,
      totalPrice = 0,
      totalWithoutVAT = 0,
      totalWithVAT = 0,
      // PITOPoints = 0,
      // transportFee = 0,
      VATFee = 0,
      PITOFee = 0,
    } = {},
    showStartPickingOrderButton,
    onClickDownloadPriceQuotation,
    foodOrderGroupedByDate,
    title,
    target,
    isAdminLayout = false,
  } = props;

  const intl = useIntl();
  const dispatch = useAppDispatch();
  const router = useRouter();
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

  const currentOrderVATPercentage = useAppSelector(
    (state) => state.SystemAttributes.currentOrderVATPercentage,
  );
  console.log({ currentOrderVATPercentage });
  const {
    query: { orderId },
  } = router;
  const rootClasses = classNames(css.root, className);
  const titleClasses = classNames(css.title, {
    [css.adminTitle]: isAdminLayout,
  });
  const downloadPriceQuotationClasses = classNames(css.downloadPriceQuotation, {
    [css.downloadingPriceQuotation]: isDownloadingPriceQuotation,
  });

  const { orderDetail } = Listing(planData as TListing).getMetadata();
  const {
    orderType = EOrderType.group,
    orderState,
    orderVATPercentage,
  } = Listing(orderData as TListing).getMetadata();
  const isStartOrderDisabled = !isEnableToStartOrder(
    orderDetail,
    orderType === EOrderType.group,
  );

  const isDraftEditing = orderState === EOrderStates.inProgress;
  const isPickingState = orderState === EOrderStates.picking;
  const isPartner = target === 'partner';
  const VATPercentage = isPickingState
    ? systemVATPercentage
    : orderVATPercentage;

  const handleStartPickingOrder = async () => {
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

  return (
    <div className={rootClasses}>
      <div className={titleClasses}>
        {title || intl.formatMessage({ id: 'ReviewCardSection.title' })}
      </div>

      <div className={css.feeContainer}>
        <div className={css.feeItem}>
          <div className={css.feeItemContainer}>
            <div className={css.label}>
              {intl.formatMessage({ id: 'ReviewCardSection.totalPrice' })}
            </div>
            <div className={css.fee}>
              {parseThousandNumber(totalPrice.toString())}đ
            </div>
          </div>
        </div>
        {isPartner && (
          <div className={css.feeItem}>
            <div className={css.feeItemContainer}>
              <div className={css.label}>
                {intl.formatMessage({ id: 'ReviewCardSection.serviceFee' })}
                <Badge label={`${serviceFee}%`} className={css.VATBadge} />
              </div>
              <div className={css.fee}>
                {parseThousandNumber(serviceFeePrice.toString())}đ
              </div>
            </div>
          </div>
        )}
        {!isPartner && (
          <div className={css.feeItem}>
            <div className={css.feeItemContainer}>
              <div className={css.label}>
                {intl.formatMessage({ id: 'ReviewCardSection.PITOFee' })}
              </div>
              <div className={css.fee}>
                {parseThousandNumber(PITOFee.toString())}đ
              </div>
            </div>
          </div>
        )}
        <div className={css.feeItem}>
          <div className={css.feeItemContainer}>
            <div className={css.label}>
              {intl.formatMessage({
                id: isAdminLayout
                  ? 'ReviewCardSection.adminPromotion'
                  : 'ReviewCardSection.promotion',
              })}
            </div>
            <div className={css.fee}>
              {parseThousandNumber(promotion.toString())}đ
            </div>
          </div>
        </div>
        <div className={css.feeItem}>
          <div className={css.feeItemContainer}>
            <div className={css.totalWithoutVATLabel}>
              {intl.formatMessage({ id: 'ReviewCardSection.totalWithoutVAT' })}
            </div>

            <div className={css.fee}>
              {parseThousandNumber(totalWithoutVAT.toString())}đ
            </div>
          </div>
        </div>
        <div className={css.feeItem}>
          <div
            className={classNames(css.feeItemContainer, css.VATItemContainer)}>
            <div className={css.label}>
              {intl.formatMessage({ id: 'ReviewCardSection.VAT' })}
              <Badge
                label={`${VATPercentage * 100}%`}
                className={css.VATBadge}
              />
            </div>
            <div className={css.fee}>
              {parseThousandNumber(VATFee.toString())}đ
            </div>
          </div>
        </div>
        <div className={css.feeItem}>
          <div className={css.totalWithVATLabel}>
            {intl.formatMessage({ id: 'ReviewCardSection.totalWithVAT' })}
          </div>
          <div className={css.totalWithVAT}>
            {parseThousandNumber(totalWithVAT.toString())}đ
          </div>
          {/* <div className={css.PITOPoints}>
            {intl.formatMessage(
              { id: 'ReviewCardSection.PITOPoints' },
              { PITOPoints },
            )}
          </div> */}
          <div className={css.totalDescription}>
            {intl.formatMessage({ id: 'ReviewCardSection.totalDescription' })}
          </div>
        </div>
      </div>

      <Button
        variant="inline"
        className={downloadPriceQuotationClasses}
        disabled={isDownloadingPriceQuotation}
        onClick={onClickDownloadPriceQuotation}>
        {intl.formatMessage({
          id: 'ReviewCardSection.downloadPriceQuotation',
        })}
      </Button>

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

      <RenderWhen condition={overflow > 0}>
        <div className={css.overflowPackageInfo}>
          {intl.formatMessage(
            {
              id: 'ReviewCardSection.overflowPackage',
            },
            {
              overflow: parseThousandNumber(overflow.toString()),
            },
          )}
        </div>
      </RenderWhen>
    </div>
  );
};

export default ReviewCartSection;
