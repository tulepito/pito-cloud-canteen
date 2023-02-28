import React from 'react';
import { useIntl } from 'react-intl';

import FilterLabelList from './FilterLabelList';
import css from './FilterLabelsSection.module.scss';

type TFilterLabelsSectionProps = {
  totalResultItems: number;
};

const FilterLabelsSection: React.FC<TFilterLabelsSectionProps> = ({
  totalResultItems,
}) => {
  const intl = useIntl();
  return (
    <div className={css.root}>
      <div className={css.resultNumber}>
        {intl.formatMessage(
          { id: 'BookerSelectRestaurant.resultNumber' },
          { totalResultItems },
        )}
      </div>
      <FilterLabelList />
    </div>
  );
};

export default FilterLabelsSection;
