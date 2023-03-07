import { useMemo } from 'react';

import { Listing } from '@utils/data';
import type { TListing } from '@utils/types';

import { getEndDate, getStartDate } from '../helpers/datetime';

export const useGetBoundaryDates = (order: TListing | null) => {
  const orderData = Listing(order as TListing);
  const { startDate: stTimestamp, endDate: enTimestamp } =
    orderData.getMetadata();

  const startDate = useMemo(() => getStartDate(stTimestamp), [stTimestamp]);
  const endDate = useMemo(() => getEndDate(enTimestamp), [enTimestamp]);

  return {
    startDate,
    endDate,
  };
};
