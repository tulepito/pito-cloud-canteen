import { useIntl } from 'react-intl';
import classNames from 'classnames';

import Badge from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import { useAppSelector } from '@hooks/reduxHooks';
import { orderDetailsAnyActionsInProgress } from '@redux/slices/OrderManagement.slice';
import type { TDefaultProps, TObject } from '@utils/types';

import css from './OrderTitle.module.scss';

type TOrderTitleProps = TDefaultProps & {
  data: {
    deliveryHour: string;
    deliveryAddress: TObject;
  };
  onConfirmOrder: () => void;
  onCancelOrder: () => void;
};

const OrderTitle: React.FC<TOrderTitleProps> = (props) => {
  const intl = useIntl();
  const {
    rootClassName,
    className,
    data: { deliveryHour, deliveryAddress = {} },
    onConfirmOrder,
    onCancelOrder,
  } = props;
  const shouldButtonDisabled = useAppSelector(orderDetailsAnyActionsInProgress);

  const rootClasses = classNames(rootClassName || css.root, className);

  const deliveryInfo = intl.formatMessage(
    {
      id: 'EditView.OrderTitle.deliveryInfo',
    },
    {
      time: <b>{deliveryHour || '12:00'}</b>,
      place: (
        <b>
          {deliveryAddress.address ||
            '123 Nguyễn Công Trứ, phường 3, quận 3, HCM'}
        </b>
      ),
    },
  ) as string;

  return (
    <div className={rootClasses}>
      <div>
        <div className={css.titleText}>
          {intl.formatMessage({ id: 'EditView.OrderTitle.title' })}
        </div>
        <Badge label={deliveryInfo} />
      </div>
      <div className={css.actions}>
        <Button
          disabled={shouldButtonDisabled}
          type="button"
          variant="cta"
          className={css.makeOrderBtn}
          onClick={onConfirmOrder}>
          {intl.formatMessage({
            id: 'EditView.OrderTitle.makeOrderButtonText',
          })}
        </Button>
        <Button
          disabled={shouldButtonDisabled}
          type="button"
          variant="secondary"
          className={css.cancelOrderBtn}
          onClick={onCancelOrder}>
          {intl.formatMessage({
            id: 'EditView.OrderTitle.cancelOrderButtonText',
          })}
        </Button>
      </div>
    </div>
  );
};

export default OrderTitle;
