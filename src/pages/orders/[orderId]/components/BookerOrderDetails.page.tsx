import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import { useAppSelector } from '@hooks/reduxHooks';
import { createNewPrint } from '@services/pdf';
import TranslationProvider from '@translations/TranslationProvider';
import type { TObject } from '@utils/types';
import { useState } from 'react';
import ReactDOM from 'react-dom';

import { usePrepareOrderDetailPageData } from '../hooks/usePrepareData';
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

  const inProgress = useAppSelector(orderDetailsAnyActionsInProgress);

  const {
    editViewData,
    reviewViewData,
    priceQuotationData,
    setReviewInfoValues,
  } = usePrepareOrderDetailPageData();

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
        data={editViewData.titleSectionData}
        onConfirmOrder={handleConfirmOrder}
      />

      <div className={css.leftPart}>
        <ManageOrdersSection data={editViewData.manageOrdersData} />
      </div>
      <div className={css.rightPart}>
        <OrderDeadlineCountdownSection
          className={css.container}
          data={editViewData.countdownSectionData}
        />
        <OrderLinkSection
          className={css.container}
          data={editViewData.linkSectionData}
        />
        <ManageParticipantsSection
          className={css.container}
          data={editViewData.manageParticipantData}
        />
      </div>
    </div>
  );

  const ReviewView = (
    <div className={css.reviewViewRoot}>
      <ReviewTitleSection
        className={css.titlePart}
        orderTitle={reviewViewData.orderTitle}
        onGoBack={handleGoBackFromReviewMode}
      />
      <div className={css.leftPart}>
        <ReviewInfoSection
          startSubmitReviewInfoForm={true}
          className={css.infoRoot}
          data={reviewViewData.reviewInfoData}
          onSubmit={handleSubmitReviewInfoForm}
        />
        <ReviewOrdersResultSection
          className={css.resultRoot}
          data={reviewViewData.reviewResultData}
          goBackToEditMode={handleGoBackFromReviewMode}
        />
        <ReviewOrderDetailsSection
          className={css.detailRoot}
          foodOrderGroupedByDate={reviewViewData.foodOrderGroupedByDate}
        />
      </div>
      <div className={css.rightPart}>
        <ReviewCartSection
          className={css.cartRoot}
          data={reviewViewData.reviewCartData}
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
