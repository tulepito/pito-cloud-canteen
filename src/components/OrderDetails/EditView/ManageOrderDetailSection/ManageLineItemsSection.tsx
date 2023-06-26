/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from 'react';
import { useIntl } from 'react-intl';
import Skeleton from 'react-loading-skeleton';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';

import RenderWhen from '@components/RenderWhen/RenderWhen';
import type { TTabsItem } from '@components/Tabs/Tabs';
import Tabs from '@components/Tabs/Tabs';
import { useAppSelector } from '@hooks/reduxHooks';
import { orderDetailsAnyActionsInProgress } from '@redux/slices/OrderManagement.slice';
import { formatTimestamp } from '@src/utils/dates';
import { historyPushState } from '@src/utils/history';

import { usePrepareManageLineItemsSectionData } from './hooks/usePrepareManageLineItemsSectionData';
import LineItemsTable from './LineItemsTable/LineItemsTable';

import css from './ManageLineItemsSection.module.scss';

type TManageLineItemsSectionProps = {
  data: {
    startDate: number;
    endDate: number;
  };
};

const ManageLineItemsSection: React.FC<TManageLineItemsSectionProps> = (
  props,
) => {
  const {
    data: { startDate },
  } = props;

  const {
    query: { timestamp },
  } = useRouter();
  const intl = useIntl();
  const inProgress = useAppSelector(orderDetailsAnyActionsInProgress);
  const [currentViewDate, setCurrentViewDate] = useState(
    timestamp ? Number(timestamp) : startDate,
  );
  const {
    dateList = [],
    // foodOptions,
  } = usePrepareManageLineItemsSectionData(currentViewDate, setCurrentViewDate);

  const items = dateList.map((date) => {
    const formattedDate = formatTimestamp(date, 'EEE, dd/MM');

    return {
      label: <div>{formattedDate}</div>,
      children: (
        <div className={css.manageOrdersContainer}>
          <div className={css.title}>
            {intl.formatMessage({
              id: 'ManageLineItemsSection.containerTitle',
            })}
          </div>
          <div className={css.lineItemDetails}>
            <LineItemsTable currentViewDate={currentViewDate} />
          </div>
        </div>
      ),
      id: date.toString(),
    };
  });

  const defaultActiveKey = items.findIndex(
    ({ id }) => id === currentViewDate.toString(),
  );

  const handleDateTabChange = ({ id }: TTabsItem) => {
    setCurrentViewDate(Number(id));
    historyPushState('timestamp', id);
  };

  return (
    <RenderWhen condition={!isEmpty(dateList)}>
      <div className={css.root}>
        <Tabs
          disabled={inProgress}
          items={items}
          onChange={handleDateTabChange}
          showNavigation
          middleLabel
          defaultActiveKey={`${
            (defaultActiveKey < 0 ? 0 : defaultActiveKey) + 1
          }`}
        />
      </div>

      <RenderWhen.False>
        <Skeleton className={css.rootSkeleton} />
      </RenderWhen.False>
    </RenderWhen>
  );
};

export default ManageLineItemsSection;
