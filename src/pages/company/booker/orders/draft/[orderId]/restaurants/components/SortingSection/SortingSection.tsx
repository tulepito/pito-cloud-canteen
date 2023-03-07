import React, { useCallback, useState } from 'react';
import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';

import SortingDropdown from './SortingDropdown';

const SortingSection: React.FC = () => {
  const router = useRouter();
  const { sortBy } = router.query;

  const intl = useIntl();
  const [currentSortBy, setCurrentSortBy] = useState<string>(
    (sortBy as string) || 'favorite',
  );

  const onChangeSortBy = useCallback(
    (value: string) => {
      setCurrentSortBy(value);
      router.push({
        query: {
          ...router.query,
          sortBy: value,
        },
      });
    },
    [router],
  );

  return (
    <SortingDropdown
      selectedValue={intl.formatMessage({
        id: `BookerSelectRestaurant.sortOption.${currentSortBy}`,
      })}
      onOptionChange={onChangeSortBy}
    />
  );
};

export default SortingSection;
