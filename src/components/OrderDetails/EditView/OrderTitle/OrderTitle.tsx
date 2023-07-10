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
    canStartOrder: boolean;
  };
  onConfirmOrder: () => void;
  onCancelOrder: () => void;
  confirmButtonMessage?: string;
  cancelButtonMessage?: string;
  confirmDisabled?: boolean;
  confirmInProgress?: boolean;
  isDraftEditing: boolean;
};

const OrderTitle: React.FC<TOrderTitleProps> = (props) => {
  const intl = useIntl();
  const {
    rootClassName,
    className,
    data: { deliveryHour, deliveryAddress = {}, canStartOrder = false },
    onConfirmOrder,
    onCancelOrder,
    confirmButtonMessage,
    cancelButtonMessage,
    confirmDisabled,
    confirmInProgress,
    isDraftEditing,
  } = props;

  const inProgress = useAppSelector(orderDetailsAnyActionsInProgress);
  const submitDisabled =
    (!isDraftEditing && !canStartOrder) || inProgress || confirmDisabled;
  const cancelOrderDisabled = inProgress;

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
        {confirmButtonMessage && (
          <Button
            disabled={submitDisabled}
            type="button"
            variant="cta"
            className={css.makeOrderBtn}
            inProgress={confirmInProgress}
            onClick={onConfirmOrder}>
            {confirmButtonMessage}
          </Button>
        )}
        {cancelButtonMessage && (
          <Button
            disabled={cancelOrderDisabled}
            type="button"
            variant="secondary"
            className={css.cancelOrderBtn}
            onClick={onCancelOrder}>
            {cancelButtonMessage}
          </Button>
        )}
      </div>
    </div>
  );
};

export default OrderTitle;
