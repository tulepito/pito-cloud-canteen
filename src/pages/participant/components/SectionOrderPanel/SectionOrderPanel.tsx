import Button, { InlineTextButton } from '@components/Button/Button';
import React from 'react';
import { useIntl } from 'react-intl';

import css from './SectionOrderPanel.module.scss';

type TSectionOrderPanelProps = {};

const SectionOrderPanel: React.FC<TSectionOrderPanelProps> = (props) => {
  const {} = props;

  const intl = useIntl();

  // Functions

  // Renders
  const sectionTitle = intl.formatMessage({
    id: 'SectionOrderPanel.sectionTitle',
  });

  const completeOrderButtonLabel = intl.formatMessage({
    id: 'SectionOrderPanel.completeOrder',
  });
  const removeAllOrderCartLabel = intl.formatMessage({
    id: 'SectionOrderPanel.removeAllOrderCartLabel',
  });

  return (
    <div className={css.root}>
      <div className={css.sectionHeader}>
        <p className={css.title}>{sectionTitle}</p>
        <p className={css.selectedDay}>(2/5 ngày đã chọn)</p>
      </div>
      <div className={css.sectionBody}></div>
      <div className={css.sectionFooter}>
        <Button fullWidth>{completeOrderButtonLabel}</Button>
        <InlineTextButton className={css.removeCartLabel}>
          {removeAllOrderCartLabel}
        </InlineTextButton>
      </div>
    </div>
  );
};

export default SectionOrderPanel;
