import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import { parseThousandNumber } from '@helpers/format';
import { useAppSelector } from '@hooks/reduxHooks';
import { currentUserSelector } from '@redux/slices/user.slice';
import { createNewPrint } from '@services/pdf';
import config from '@src/configs';
import TranslationProvider from '@translations/TranslationProvider';
import type { TObject } from '@utils/types';
import get from 'lodash/get';
import { useMemo, useState } from 'react';
import ReactDOM from 'react-dom';

import { calculateTotalPriceAndDishes } from '../helpers/cartInfoHelper';
import { groupFoodOrderByDate } from '../helpers/orderDetailHelper';
import { orderDetailsAnyActionsInProgress } from '../OrderManagement.slice';
import css from './BookerOrderDetails.module.scss';
import BookerOrderDetailsTitle from './BookerOrderDetailsEditView/BookerOrderDetailsTitle/BookerOrderDetailsTitle';
import ManageOrdersSection from './BookerOrderDetailsEditView/ManageOrdersSection/ManageOrdersSection';
import ManageParticipantsSection from './BookerOrderDetailsEditView/ManageParticipantsSection/ManageParticipantsSection';
import OrderDeadlineCountdownSection from './BookerOrderDetailsEditView/OrderDeadlineCountdownSection/OrderDeadlineCountdownSection';
import OrderLinkSection from './BookerOrderDetailsEditView/OrderLinkSection/OrderLinkSection';
import BookerOrderDetailsPriceQuotation from './BookerOrderDetailsPriceQuotation/BookerOrderDetailsPriceQuotation';
import ReviewCartSection from './BookerOrderDetailsReviewView/ReviewCartSection/ReviewCartSection';
import type { TReviewInfoFormValues } from './BookerOrderDetailsReviewView/ReviewInfoSection/ReviewInfoForm';
import ReviewInfoSection from './BookerOrderDetailsReviewView/ReviewInfoSection/ReviewInfoSection';
import ReviewOrderDetailsSection from './BookerOrderDetailsReviewView/ReviewOrderDetailsSection/ReviewOrderDetailsSection';
import ReviewOrdersResultSection from './BookerOrderDetailsReviewView/ReviewOrdersResultSection/ReviewOrdersResultSection';
import ReviewTitleSection from './BookerOrderDetailsReviewView/ReviewTitleSection/ReviewTitleSection';

enum EPageViewMode {
  edit = 'edit',
  review = 'review',
  priceQuotation = 'priceQuotation',
}

const BookerOrderDetailsPage = () => {
  const [viewMode, setViewMode] = useState<EPageViewMode>(EPageViewMode.edit);
  const { orderData, planData, participantData, companyData } = useAppSelector(
    (state) => state.OrderManagement,
  );
  const inProgress = useAppSelector(orderDetailsAnyActionsInProgress);
  const currentUser = useAppSelector(currentUserSelector);
  const [reviewInfoValues, setReviewInfoValues] =
    useState<TReviewInfoFormValues>();

  const { title: orderTitle = '' } = orderData?.attributes || {};
  const { email: bookerEmail } = get(currentUser, 'attributes', '');
  const { generalInfo = {}, participants = [] } =
    orderData?.attributes?.metadata || {};
  const {
    startDate = 0,
    endDate = 0,
    deliveryHour,
    deliveryAddress,
    orderDeadline = 0,
    deadlineHour,
    staffName,
    packagePerMember = 0,
  } = generalInfo || {};
  const { orderDetail } = get(planData, 'attributes.metadata', {});
  const { companyName } = get(companyData, 'attributes.profile.publicData', {});

  /* =============== Edit data =============== */
  const titleSectionData = { deliveryHour, deliveryAddress };
  const countdownSectionData = { deadlineHour, orderDeadline, startDate };
  const linkSectionData = { orderDeadline };
  const manageParticipantData = {
    planData,
    participantData,
  };
  const manageOrdersData = {
    startDate,
    endDate,
  };

  /* =============== Review data =============== */
  const totalInfo = useMemo(
    () => calculateTotalPriceAndDishes({ orderDetail }),
    [orderDetail],
  );
  const foodOrderGroupedByDate = useMemo(
    () => groupFoodOrderByDate({ orderDetail }),
    [orderDetail],
  );

  const { totalPrice = 0, totalDishes = 0 } = totalInfo || {};
  const PITOPoints = totalPrice / 100000;
  const isOverflowPackage = totalDishes * packagePerMember < totalPrice;

  const VATFee = totalPrice * config.VATPercentage;
  const serviceFee = 0;
  const transportFee = 0;
  const promotion = 0;
  const totalWithoutVAT = totalPrice + serviceFee + transportFee - promotion;
  const totalWithVAT = VATFee + totalWithoutVAT;
  const overflow = isOverflowPackage
    ? totalWithVAT - totalDishes * packagePerMember
    : 0;

  const reviewInfoData = {
    reviewInfoValues,
    deliveryAddress,
    staffName,
    companyName,
  };
  const reviewResultData = {
    participantData,
    participants,
    orderDetail,
  };
  const reviewCartData = {
    overflow,
    PITOPoints,
    promotion,
    serviceFee,
    totalPrice,
    totalWithoutVAT,
    totalWithVAT,
    transportFee,
    VATFee,
  };
  /* =============== Price quotation data =============== */
  const priceQuotationData = {
    customerData: {
      ...(reviewInfoValues || {}),
      email: bookerEmail,
    },
    orderData: {
      orderTitle,
      companyName,
      startDate,
      endDate,
    },
    cartData: {
      serviceFee: `${parseThousandNumber(serviceFee.toString())}đ`,
      totalPrice: `${parseThousandNumber(totalPrice.toString())}đ`,
      promotion: `${parseThousandNumber(promotion.toString())}đ`,
      totalWithVAT: `${parseThousandNumber(totalWithVAT.toString())}đ`,
      transportFee: `${parseThousandNumber(transportFee.toString())}đ`,
      VATFee: `${parseThousandNumber(VATFee.toString())}đ`,
    },
    orderDetailData: {
      foodOrderGroupedByDate,
    },
  };

  const handleConfirmOrder = () => {
    setViewMode(EPageViewMode.review);
  };

  const handleGoBackFromReviewMode = () => {
    setViewMode(EPageViewMode.edit);
  };

  const handleSubmitReviewInfoForm = (_values: TReviewInfoFormValues) => {
    setReviewInfoValues(_values);
  };

  const handleDownloadPriceQuotation = async () => {
    const ele = (
      <TranslationProvider>
        <BookerOrderDetailsPriceQuotation data={priceQuotationData} />
      </TranslationProvider>
    );
    const div = document.createElement('div');
    document.body.appendChild(div);
    ReactDOM.render(ele, div);

    await createNewPrint('priceQuotation').then((response) => {
      const { doc, id } = response as TObject;
      if (doc && id) {
        const fileName = `${id}.pdf`;
        doc.save(fileName, { returnPromise: true }).then((_res: any) => {});
      }
    });

    document.body.removeChild(div);
  };

  const EditView = (
    <div className={css.editViewRoot}>
      <BookerOrderDetailsTitle
        className={css.titlePart}
        data={titleSectionData}
        onConfirmOrder={handleConfirmOrder}
      />

      <div className={css.leftPart}>
        <ManageOrdersSection data={manageOrdersData} />
      </div>
      <div className={css.rightPart}>
        <OrderDeadlineCountdownSection
          className={css.container}
          data={countdownSectionData}
        />
        <OrderLinkSection className={css.container} data={linkSectionData} />
        <ManageParticipantsSection
          className={css.container}
          data={manageParticipantData}
        />
      </div>
    </div>
  );

  const ReviewView = (
    <div className={css.reviewViewRoot}>
      <ReviewTitleSection
        className={css.titlePart}
        orderTitle={orderTitle}
        onGoBack={handleGoBackFromReviewMode}
      />
      <div className={css.leftPart}>
        <ReviewInfoSection
          startSubmitReviewInfoForm={true}
          className={css.infoRoot}
          data={reviewInfoData}
          onSubmit={handleSubmitReviewInfoForm}
        />
        <ReviewOrdersResultSection
          className={css.resultRoot}
          data={reviewResultData}
          goBackToEditMode={handleGoBackFromReviewMode}
        />
        <ReviewOrderDetailsSection
          className={css.detailRoot}
          foodOrderGroupedByDate={foodOrderGroupedByDate}
        />
      </div>
      <div className={css.rightPart}>
        <ReviewCartSection
          className={css.cartRoot}
          data={reviewCartData}
          onClickDownloadPriceQuotation={handleDownloadPriceQuotation}
        />
      </div>
    </div>
  );

  const renderView = () => {
    switch (viewMode) {
      case EPageViewMode.priceQuotation:
        return <BookerOrderDetailsPriceQuotation data={priceQuotationData} />;
      case EPageViewMode.review:
        return ReviewView;
      case EPageViewMode.edit:
      default:
        return EditView;
    }
  };

  return <>{inProgress ? <LoadingContainer /> : renderView()}</>;
};

export default BookerOrderDetailsPage;
