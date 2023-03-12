import { useIntl } from 'react-intl';

import Button, { InlineTextButton } from '@components/Button/Button';

import css from './SectionOrderPanel.module.scss';

type TOrderPanelFooter = {
  className?: string;
  submitDataInprogress?: boolean;
  isOrderDeadlineOver: boolean;
  handleSubmit: () => void;
  handleRemoveAllItem: () => void;
  cartListKeys?: string[];
};

const OrderPanelFooter: React.FC<TOrderPanelFooter> = ({
  submitDataInprogress,
  cartListKeys = [],
  isOrderDeadlineOver,
  handleSubmit,
  handleRemoveAllItem,
}) => {
  const intl = useIntl();

  const submitDisabled =
    isOrderDeadlineOver || submitDataInprogress || cartListKeys.length === 0;
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
        disabled={submitDisabled}
        inProgress={submitDataInprogress}>
        {completeOrderButtonLabel}
      </Button>
      <InlineTextButton
        disabled={removeAllDisabled}
        className={css.removeCartLabel}
        onClick={handleRemoveAllItem}>
        {removeAllOrderCartLabel}
      </InlineTextButton>
    </div>
  );
};

export default OrderPanelFooter;
