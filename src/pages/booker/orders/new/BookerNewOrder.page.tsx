import Modal from '@components/Modal/Modal';
// import { useAppDispatch } from '@hooks/reduxHooks';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';

import css from './BookerNewOrder.module.scss';
import CreateOrderForm from './CreateOrderForm';

function BookerNewOrderPage() {
  const intl = useIntl();
  const route = useRouter();
  // const dispatch = useAppDispatch();

  const handleCancel = () => {
    route.push('/booker/orders');
  };

  const handleSubmit = (values: any) => {
    console.log('values', values);
    // dispatch(BookerNewOrderThunks.createDraftOrder(values));
    route.push('/booker/orders/draft');
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
                id: '1234',
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
          />
        </div>
      </Modal>
    </div>
  );
}

export default BookerNewOrderPage;
