import classNames from 'classnames';
import { DateTime } from 'luxon';

import IconNoteBook from '@components/Icons/IconNoteBook/IconNoteBook';
import IconNoteCheckList from '@components/Icons/IconNoteCheckList/IconNoteCheckList';
import { formatTimestamp } from '@src/utils/dates';
import { FORMATTED_WEEKDAY } from '@src/utils/options';
import type { TDefaultProps } from '@src/utils/types';

import css from './AutomaticStartOrInfoSection.module.scss';

type TAutomaticStartOrInfoSectionProps = TDefaultProps & {
  startDate: number;
  deliveryHour: string;
};

const AutomaticStartOrInfoSection: React.FC<
  TAutomaticStartOrInfoSectionProps
> = ({ startDate, deliveryHour, className }) => {
  const classes = classNames(css.root, className);

  const normalizedDeliveryHour = deliveryHour?.includes('-')
    ? deliveryHour.split('-')[0]
    : deliveryHour;
  const automaticConfirmDate = DateTime.fromMillis(Number(startDate)).minus({
    days: 1,
  });
  const formattedAutomaticConfirmOrder = `${
    FORMATTED_WEEKDAY[automaticConfirmDate.weekday]
  }, ${formatTimestamp(automaticConfirmDate.toMillis(), 'dd/MM/yyyy')}`;

  return (
    <div className={classes}>
      <div className={css.columnContainer}>
        <IconNoteCheckList />
        <div>
          <div className={css.columnTitle}>Tự động đặt đơn</div>
          <div>
            Đơn sẽ được tự động đặt vào lúc{' '}
            <b>
              {normalizedDeliveryHour} {formattedAutomaticConfirmOrder}
            </b>
            . Trường hợp nếu đến hạn mà không đủ số lượng đặt món thì đơn sẽ bị
            hủy.
          </div>
        </div>
      </div>
      <div className={css.columnContainer}>
        <IconNoteBook />
        <div>
          <div className={css.columnTitle}>
            Tự động hủy tham gia cho thành viên
          </div>
          <div>
            Nếu quá thời hạn mà thành viên chưa chọn món thì sẽ được xem như là
            không tham gia ngày ăn.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomaticStartOrInfoSection;
