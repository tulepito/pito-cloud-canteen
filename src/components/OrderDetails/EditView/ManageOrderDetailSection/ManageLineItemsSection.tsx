/* eslint-disable react-hooks/exhaustive-deps */
import { useIntl } from 'react-intl';
import Skeleton from 'react-loading-skeleton';
import isEmpty from 'lodash/isEmpty';

import RenderWhen from '@components/RenderWhen/RenderWhen';
import type { TTabsItem } from '@components/Tabs/Tabs';
import Tabs from '@components/Tabs/Tabs';
import { historyPushState } from '@helpers/urlHelpers';
import { useAppSelector } from '@hooks/reduxHooks';
import { orderDetailsAnyActionsInProgress } from '@redux/slices/OrderManagement.slice';
import { formatTimestamp } from '@src/utils/dates';

import { usePrepareManageLineItemsSectionData } from './hooks/usePrepareManageLineItemsSectionData';
import LineItemsTable from './LineItemsTable/LineItemsTable';

import css from './ManageLineItemsSection.module.scss';

type TManageLineItemsSectionProps = {
  currentViewDate: number;
  isDraftEditing?: boolean;
  shouldShowOverflowError?: boolean;
  shouldShowUnderError?: boolean;
  setCurrentViewDate: (date: number) => void;
  ableToUpdateOrder?: boolean;
  minQuantity?: number;
  isAdminFlow?: boolean;
  unChangedRestaurantDayList?: string[];
};

const ManageLineItemsSection: React.FC<TManageLineItemsSectionProps> = (
  props,
) => {
  const {
    isDraftEditing,
    currentViewDate,
    setCurrentViewDate,
    ableToUpdateOrder = true,
    shouldShowUnderError = false,
    shouldShowOverflowError = false,
    minQuantity = 0,
    isAdminFlow = false,
    unChangedRestaurantDayList = [],
  } = props;

  const intl = useIntl();
  const inProgress = useAppSelector(orderDetailsAnyActionsInProgress);
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
            <LineItemsTable
              currentViewDate={currentViewDate}
              isDraftEditing={isDraftEditing}
              ableToUpdateOrder={
                ableToUpdateOrder &&
                !unChangedRestaurantDayList.includes(date.toString())
              }
              shouldShowOverflowError={shouldShowOverflowError}
              shouldShowUnderError={shouldShowUnderError}
              minQuantity={minQuantity}
              isAdminFlow={isAdminFlow}
            />
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
          shouldShowNavigatorBorder
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
