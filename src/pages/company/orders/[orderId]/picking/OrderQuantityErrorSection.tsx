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
  return (
    <div style={{ fontWeight: 500 }}>
      {planReachMaxCanModifyInProgressState && (
        <ErrorMessage
          className={css.error}
          message={`Bạn đã thay đổi vượt mức quy định (tối đa ${process.env.NEXT_PUBLIC_MAX_ORDER_DETAIL_MODIFIED_PERCENT}% số lượng người tham gia)`}
        />
      )}
      {planReachMaxRestaurantQuantity && (
        <ErrorMessage
          className={css.error}
          message={`Bạn đã đặt vượt mức tối đa (${maxQuantity} phần)`}
        />
      )}
      {planReachMinRestaurantQuantity && (
        <ErrorMessage
          className={css.error}
          message={`Cần đặt tối thiểu ${minQuantity} phần`}
        />
      )}
    </div>
  );
}

export default OrderQuantityErrorSection;
