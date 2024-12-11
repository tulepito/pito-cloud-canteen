import { useIntl } from 'react-intl';

import Button from '@components/Button/Button';
import { verifyAllFoodPickedWithParticipant } from '@pages/participant/helpers';

import css from './SectionOrderPanel.module.scss';

type TOrderPanelFooter = {
  className?: string;
  submitDataInprogress?: boolean;
  isOrderDeadlineOver: boolean;
  handleSubmit: () => void;
  handleRemoveAllItem: () => void;
  cartListKeys?: string[];
  orderDetailIds: string[];
  cartList: {
    [dayId: number]: {
      foodId: string;
      requirement: string;
    };
  };
};

const OrderPanelFooter: React.FC<TOrderPanelFooter> = ({
  submitDataInprogress,
  cartListKeys = [],
  orderDetailIds = [],
  isOrderDeadlineOver,
  handleSubmit,
  handleRemoveAllItem,
  cartList,
}) => {
  const intl = useIntl();
  const submitDisabled =
    isOrderDeadlineOver ||
    submitDataInprogress ||
    cartListKeys.length === 0 ||
    verifyAllFoodPickedWithParticipant(orderDetailIds, cartList);

  const removeAllDisabled = isOrderDeadlineOver || cartListKeys.length === 0;

  const completeOrderButtonLabel = intl.formatMessage({
    id: 'SectionOrderPanel.completeOrder',
  });
  const removeAllOrderCartLabel = intl.formatMessage({
    id: 'SectionOrderPanel.removeAllOrderCartLabel',
  });

  return (
    <div className={css.sectionFooter}>
      <Button
        fullWidth
        onClick={handleSubmit}
        variant="primary"
        disabled={submitDisabled}
        inProgress={submitDataInprogress}>
        {completeOrderButtonLabel}
      </Button>
      <Button
        variant="inline"
        disabled={removeAllDisabled}
        className={css.removeCartLabel}
        onClick={handleRemoveAllItem}>
        {removeAllOrderCartLabel}
      </Button>
    </div>
  );
};

export default OrderPanelFooter;
