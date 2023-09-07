import Badge, { EBadgeType } from '@components/Badge/Badge';
import IconReceipt from '@components/Icons/IconReceipt/IconReceipt';
import { parseThousandNumber } from '@helpers/format';
import { EOrderPaymentState } from '@src/utils/enums';
import type { TObject } from '@src/utils/types';

import css from './MobilePaymentCard.module.scss';

type TMobilePaymentCardProps = {
  paymentData: TObject;
};

const MobilePaymentCard: React.FC<TMobilePaymentCardProps> = ({
  paymentData,
}) => {
  const {
    subOrderName = '-',
    orderTitle = '-',
    totalAmount = 0,
    status = EOrderPaymentState.isNotPaid,
    paidAmount = 0,
    remainAmount = 0,
  } = paymentData;
  const isPaid = status === EOrderPaymentState.isPaid;

  return (
    <div className={css.root}>
      <div className={css.titleContainer}>
        <div className={css.subOrderName}>{subOrderName}</div>
        <div className={css.orderTitle}>#{orderTitle}</div>
      </div>

      <div className={css.twoColumn}>
        <div className={css.totalAmount}>
          <IconReceipt />
          {parseThousandNumber(totalAmount)}đ
        </div>
        <Badge
          type={isPaid ? EBadgeType.success : EBadgeType.warning}
          label={isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
        />
      </div>
      <div className={css.twoColumn}>
        <div className={css.grayLabel}>Đã thanh toán</div>
        {parseThousandNumber(paidAmount)}đ
      </div>
      <div className={css.twoColumn}>
        <div className={css.grayLabel}>Còn lại</div>
        {parseThousandNumber(remainAmount)}đ
      </div>
    </div>
  );
};

export default MobilePaymentCard;
