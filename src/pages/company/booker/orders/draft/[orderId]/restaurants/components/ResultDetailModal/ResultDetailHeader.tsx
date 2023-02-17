import Badge, { EBadgeType } from '@components/Badge/Badge';
import React from 'react';
import { useIntl } from 'react-intl';

import css from './ResultDetailModal.module.scss';

const ResultDetailHeader: React.FC = () => {
  const intl = useIntl();
  const selectedDishText = intl.formatMessage(
    {
      id: 'booker.orders.draft.resultDetailModal.selectedDish',
    },
    {
      number: 4,
    },
  );

  return (
    <div className={css.header}>
      <div className={css.title}>Nhà hàng Vua hải sản</div>
      <Badge
        className={css.modalBadge}
        label={selectedDishText}
        type={EBadgeType.PROCESSING}
        hasDotIcon={true}
      />
    </div>
  );
};

export default ResultDetailHeader;
