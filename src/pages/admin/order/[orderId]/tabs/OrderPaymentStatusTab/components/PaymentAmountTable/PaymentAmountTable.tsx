import RenderWhen from '@components/RenderWhen/RenderWhen';
import { parseThousandNumber } from '@helpers/format';

import css from './PaymentAmountTable.module.scss';

type PaymentAmountTableProps = {
  tableTitle?: string;
  totalPrice: number;
  paidAmount: number;
};

const PaymentAmountTable: React.FC<PaymentAmountTableProps> = (props) => {
  const { tableTitle, totalPrice, paidAmount = 0 } = props;

  return (
    <div className={css.container}>
      <RenderWhen condition={!!tableTitle}>
        <div className={css.tableTitle}>{tableTitle}</div>
      </RenderWhen>

      <div className={css.tableContainer}>
        <div className={css.row}>
          <span>Tổng giá tiền</span>
          <span>{parseThousandNumber(totalPrice.toString())}đ</span>
        </div>
        <div className={css.row}>
          <span>Đã thanh toán</span>
          <span>{parseThousandNumber(paidAmount.toString())}đ</span>
        </div>
        <div className={css.row}>
          <span>Còn lại</span>
          <span>
            {parseThousandNumber(
              (paidAmount >= totalPrice
                ? 0
                : totalPrice - paidAmount
              ).toString(),
            )}
            đ
          </span>
        </div>
      </div>
    </div>
  );
};

export default PaymentAmountTable;
