import Button, { InlineTextButton } from '@components/Button/Button';
import { useIntl } from 'react-intl';

import css from './SectionOrderPanel.module.scss';

type TOrderPanelFooter = {
  className?: string;
  submitDataInprogress?: boolean;
  handleSubmit: () => void;
  handleRemoveAllItem: () => void;
  cartListKeys?: string[];
};

const OrderPanelFooter: React.FC<TOrderPanelFooter> = ({
  submitDataInprogress,
  cartListKeys = [],
  handleSubmit,
  handleRemoveAllItem,
}) => {
  const intl = useIntl();

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
        disabled={submitDataInprogress || cartListKeys.length === 0}
        inProgress={submitDataInprogress}>
        {completeOrderButtonLabel}
      </Button>
      <InlineTextButton
        className={css.removeCartLabel}
        onClick={handleRemoveAllItem}>
        {removeAllOrderCartLabel}
      </InlineTextButton>
    </div>
  );
};

export default OrderPanelFooter;
