import Modal from '@components/Modal/Modal';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { OrderAsyncAction } from '@redux/slices/Order.slice';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';

import css from './BookerNewOrder.module.scss';
import CreateOrderForm from './CreateOrderForm';

function BookerNewOrderPage() {
  const intl = useIntl();
  const route = useRouter();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.user.currentUser);

  // Redux
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
        OrderAsyncAction.createOrder({
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
            companies={[
              {
                id: '63c76be1-7dd8-40fd-9920-b087847943fd',
                name: 'Chu Tuan',
              },
              {
                id: '1235',
                name: 'Journey Horizon',
              },
              {
                id: '1236',
                name: 'Shopee',
              },
              {
                id: '1237',
                name: 'Lazada',
              },
            ]}
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
            initialValues={{
              company: '1235',
            }}
            submitInprogress={createOrderInProcess}
            submitError={createOrderError}
          />
        </div>
      </Modal>
    </div>
  );
}

export default BookerNewOrderPage;
