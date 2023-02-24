import Badge, { EBadgeType } from '@components/Badge/Badge';
import { Listing } from '@utils/data';
import type { TListing } from '@utils/types';
import React from 'react';
import { useIntl } from 'react-intl';

import css from './ResultDetailModal.module.scss';

type TResultDetailHeaderProps = {
  restaurant?: TListing;
  numberSelectedDish?: number;
};

const ResultDetailHeader: React.FC<TResultDetailHeaderProps> = ({
  restaurant,
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
      <div className={css.title}>
        {Listing(restaurant!).getAttributes().title}
      </div>
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
