import Modal from '@components/Modal/Modal';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { orderAsyncActions } from '@redux/slices/Order.slice';
import { User } from '@utils/data';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';

import css from './BookerNewOrder.module.scss';
import CreateOrderForm from './CreateOrderForm';
import useLoadCompanies from './hooks/loadCompanies';

function BookerNewOrderPage() {
  const intl = useIntl();
  const route = useRouter();
  const dispatch = useAppDispatch();

  // Redux
  const currentUser = useAppSelector((state) => state.user.currentUser);
  const createOrderInProcess = useAppSelector(
    (state) => state.Order.createOrderInProcess,
  );
  const createOrderError = useAppSelector(
    (state) => state.Order.createOrderError,
  );

  const handleCancel = () => {
    route.push('/company/booker/orders');
  };

  const handleSubmit = async (values: any) => {
    try {
      const newOrder = await dispatch(
        orderAsyncActions.createOrder({
          clientId: values.company,
          bookerId: currentUser?.id?.uuid,
        }),
      );
      const newOrderId = newOrder?.payload?.id?.uuid;

      route.push(`/company/booker/orders/draft/${newOrderId}`);
    } catch (error) {
      console.log('error', error);
    }
  };

  const { myCompanies = [] } = useLoadCompanies();
  const normalizedCompanies = myCompanies.map((company) => ({
    id: company?.id?.uuid,
    name: User(company).getPublicData()?.companyName,
  }));

  return (
    <div className={css.root}>
      <Modal
        isOpen={true}
        handleClose={() => null}
        containerClassName={css.modalContainer}
        scrollLayerClassName={css.modalScrollLayer}
        openClassName={css.openModal}
        title={intl.formatMessage({
          id: 'BookerNewOrder.modal.createTitle',
        })}>
        <div className={css.modalContent}>
          <CreateOrderForm
            companies={normalizedCompanies}
            previousOrders={[
              {
                id: '1234',
                name: 'Chu Tuan',
              },
              {
                id: '1235',
                name: 'Journey Horizon',
              },
            ]}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitInprogress={createOrderInProcess}
            submitError={createOrderError}
          />
        </div>
      </Modal>
    </div>
  );
}

export default BookerNewOrderPage;
