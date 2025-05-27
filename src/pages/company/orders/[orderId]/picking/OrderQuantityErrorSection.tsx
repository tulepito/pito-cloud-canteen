import { useIntl } from 'react-intl';

import ErrorMessage from '@components/ErrorMessage/ErrorMessage';

import css from './OrderDetail.module.scss';

function OrderQuantityErrorSection({
  planReachMaxCanModifyInProgressState,
  planReachMaxRestaurantQuantity,
  planReachMinRestaurantQuantity,
  maxQuantity,
  minQuantity,
}: {
  planReachMaxCanModifyInProgressState?: boolean;
  planReachMaxRestaurantQuantity?: boolean;
  planReachMinRestaurantQuantity?: boolean;
  maxQuantity: number;
  minQuantity: number;
}) {
  const intl = useIntl();

  return (
    <div style={{ fontWeight: 500 }}>
      {planReachMaxCanModifyInProgressState && (
        <ErrorMessage
          className={css.error}
          message={`${intl.formatMessage({
            id: 'ban-da-thay-doi-vuot-muc-quy-dinh-toi-da',
          })} ${
            process.env.NEXT_PUBLIC_MAX_ORDER_DETAIL_MODIFIED_PERCENT
          }% ${intl.formatMessage({ id: 'so-luong-nguoi-tham-gia' })})`}
        />
      )}
      {planReachMaxRestaurantQuantity && (
        <ErrorMessage
          className={css.error}
          message={`${intl.formatMessage({
            id: 'ban-da-dat-vuot-muc-toi-da',
          })} (${maxQuantity} ${intl.formatMessage({ id: 'phan' })})`}
        />
      )}
      {planReachMinRestaurantQuantity && (
        <ErrorMessage
          className={css.error}
          message={`${intl.formatMessage({
            id: 'can-dat-toi-thieu',
          })} ${minQuantity} ${intl.formatMessage({ id: 'phan' })}`}
        />
      )}
    </div>
  );
}

export default OrderQuantityErrorSection;
