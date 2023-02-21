import Badge, { EBadgeType } from '@components/Badge/Badge';
import React from 'react';
import { useIntl } from 'react-intl';

import css from './ResultDetailModal.module.scss';

type TResultDetailHeaderProps = {
  numberSelectedDish?: number;
};

const ResultDetailHeader: React.FC<TResultDetailHeaderProps> = ({
  numberSelectedDish = 0,
}) => {
  const intl = useIntl();
  const selectedDishText = intl.formatMessage(
    {
      id: 'booker.orders.draft.resultDetailModal.selectedDish',
    },
    {
      number: numberSelectedDish,
    },
  );

  return (
    <div className={css.header}>
      <div className={css.title}>Nhà hàng Vua hải sản</div>
      <Badge
        className={css.modalBadge}
        label={selectedDishText}
        type={
          numberSelectedDish > 0 ? EBadgeType.PROCESSING : EBadgeType.WARNING
        }
        hasDotIcon={true}
      />
    </div>
  );
};

export default ResultDetailHeader;
