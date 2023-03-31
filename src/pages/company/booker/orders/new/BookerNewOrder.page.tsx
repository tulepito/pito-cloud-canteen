import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';

import Modal from '@components/Modal/Modal';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { resetOrder } from '@redux/slices/Order.slice';
import { QuizThunks } from '@redux/slices/Quiz.slice';
import { companyPaths, quizPaths } from '@src/paths';
import { User } from '@utils/data';

import useLoadCompanies from './hooks/loadCompanies';
import CreateOrderForm from './CreateOrderForm';

import css from './BookerNewOrder.module.scss';

function BookerNewOrderPage() {
  const intl = useIntl();
  const route = useRouter();
  const dispatch = useAppDispatch();
  // Local state
  const [isSubmitting, setiIsSubmitting] = useState(false);

  // Redux
  const createOrderInProcess = useAppSelector(
    (state) => state.Order.createOrderInProcess,
  );
  const createOrderError = useAppSelector(
    (state) => state.Order.createOrderError,
  );

  const { myCompanies = [], queryInprogress: queryCompanyInprogress } =
    useLoadCompanies();

  useEffect(() => {
    dispatch(resetOrder());
  }, [dispatch]);

  const normalizedCompanies = myCompanies.map((company) => ({
    id: company?.id?.uuid,
    name: User(company).getPublicData()?.companyName,
    location: User(company).getPublicData()?.location,
  }));

  const handleCancel = () => {
    route.push(companyPaths.Home);
  };

  const handleSubmit = async (values: any) => {
    setiIsSubmitting(true);
    try {
      await dispatch(QuizThunks.fetchSelectedCompany(values.company));
      setiIsSubmitting(false);
      route.push({
        pathname: quizPaths.PerpackMemberAmount,
        query: route.query,
      });
    } catch (error) {
      setiIsSubmitting(false);
      console.error('error', error);
    }
  };

  return (
    <div className={css.root}>
      <Modal
        isOpen={true}
        handleClose={handleCancel}
        containerClassName={css.modalContainer}
        scrollLayerClassName={css.modalScrollLayer}
        openClassName={css.openModal}
        title={intl.formatMessage({
          id: 'BookerNewOrder.modal.createTitle',
        })}>
        <div className={css.modalContent}>
          <CreateOrderForm
            companies={normalizedCompanies}
            previousOrders={[]}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            queryInprogress={queryCompanyInprogress}
            submitInprogress={createOrderInProcess || isSubmitting}
            submitError={createOrderError}
          />
        </div>
      </Modal>
    </div>
  );
}

export default BookerNewOrderPage;
