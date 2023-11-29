import { useState } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import { useRouter } from 'next/router';

import Modal from '@components/Modal/Modal';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useFetchCompanyInfo from '@hooks/useFetchCompanyInfo';
import { QuizActions, QuizThunks } from '@redux/slices/Quiz.slice';
import { companyPaths } from '@src/paths';
import { QuizStep } from '@src/utils/enums';
import { User } from '@utils/data';

import useLoadCompanies from './hooks/loadCompanies';
import QuizCreateOrderLoadingModal from './quiz/create-order-loading/QuizCreateOrderLoadingModal';
import { useQuizFlow } from './quiz/hooks/useQuizFlow';
import { useQuizModalScrollControl } from './quiz/hooks/useQuizModalScrollControl';
import CreateOrderFinalForm from './CreateOrderFinalForm';

import css from './BookerNewOrder.module.scss';

function BookerNewOrderPage() {
  const intl = useIntl();
  const router = useRouter();
  const dispatch = useAppDispatch();
  // Local state
  const [isSubmitting, setiIsSubmitting] = useState(false);
  const isCopyPreviousOrder = useAppSelector(
    (state) => state.Quiz.isCopyPreviousOrder,
  );

  const {
    nextStep,
    submitCreateOrder,
    creatingOrderInProgress,
    creatingOrderError,
  } = useQuizFlow(QuizStep.NEW_ORDER);
  useFetchCompanyInfo();

  const { modalContentRef, onClickOrderDates, onClickDeadlineDate } =
    useQuizModalScrollControl();

  // Redux
  const createOrderInProcess = useAppSelector(
    (state) => state.Order.createOrderInProcess,
  );
  const previousOrder = useAppSelector((state) => state.Quiz.previousOrder);
  const reorderOpen = useAppSelector((state) => state.Quiz.reorderOpen);

  const {
    myCompanies = [],
    queryInprogress: queryCompanyInprogress,
    companyId,
  } = useLoadCompanies();

  const currentPathName = router.pathname;

  const modalContainerClasses = classNames(css.modalContainer, {
    [css.largeContainer]: isCopyPreviousOrder || reorderOpen,
  });

  const normalizedCompanies = myCompanies.map((company) => ({
    id: company?.id?.uuid,
    name: User(company).getPublicData().companyName,
    location: User(company).getPublicData().location,
  }));

  const handleCancel = () => {
    dispatch(QuizActions.closeQuizFlow());

    if (currentPathName === companyPaths.CreateNewOrder) {
      router.push(companyPaths.Home);
    }
  };

  const handleSubmit = async (values: any) => {
    setiIsSubmitting(true);
    try {
      await dispatch(QuizThunks.fetchSelectedCompany(values.company));
      if (values.usePreviousData || reorderOpen) {
        dispatch(QuizActions.updateQuiz({ ...values }));
        submitCreateOrder();
      } else {
        nextStep();
      }
    } catch (error) {
      console.error('error', error);
    } finally {
      setiIsSubmitting(false);
    }
  };

  return !creatingOrderInProgress ? (
    <div className={css.root}>
      <Modal
        isOpen={true}
        handleClose={handleCancel}
        containerClassName={modalContainerClasses}
        scrollLayerClassName={css.modalScrollLayer}
        modalContainerRef={modalContentRef}
        openClassName={css.openModal}>
        <div className={css.modalContent}>
          <div className={css.title}>
            {intl.formatMessage({
              id: 'BookerNewOrder.modal.createTitle',
            })}
          </div>
          <div className={css.formContainer}>
            <CreateOrderFinalForm
              companies={normalizedCompanies}
              previousOrder={previousOrder}
              onSubmit={handleSubmit}
              queryInprogress={queryCompanyInprogress}
              submitInprogress={createOrderInProcess || isSubmitting}
              hasPreviousOrder={!!previousOrder}
              reorderOpen={reorderOpen}
              onClickOrderDates={onClickOrderDates}
              onClickDeadlineDate={onClickDeadlineDate}
              initialValues={{
                company: companyId,
              }}
            />
          </div>
        </div>
      </Modal>
    </div>
  ) : (
    <QuizCreateOrderLoadingModal creatingOrderError={creatingOrderError} />
  );
}

export default BookerNewOrderPage;
