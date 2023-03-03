import classNames from 'classnames';
import { useIntl } from 'react-intl';

import css from './OrderDetailsTable.module.scss';
import type { TAllTabData, TItemData } from './OrderDetailsTable.utils';
import { EOrderDetailsTableTab, TABLE_TABS } from './OrderDetailsTable.utils';
import { OrderDetailsTableComponent } from './OrderDetailsTableComponent';

type TUsePrepareTabItemsParams = {
  allTabData: TAllTabData;
  tableHeads: string[];
  deletedTabData: TItemData[];
  currentTab: EOrderDetailsTableTab;
  handleClickEditOrderItem: (
    tab: EOrderDetailsTableTab,
    memberId: string,
  ) => () => void;
  handleClickDeleteOrderItem: (memberId: string) => () => void;
  handleRestoreMembers: (memberIds: string[]) => void;
  handleDeletePermanentlyMembers: (memberIds: string[]) => void;
};

export const usePrepareTabItems = ({
  allTabData,
  tableHeads,
  deletedTabData,
  currentTab,
  handleClickEditOrderItem,
  handleClickDeleteOrderItem,
  handleRestoreMembers,
  handleDeletePermanentlyMembers,
}: TUsePrepareTabItemsParams) => {
  const intl = useIntl();

  return Object.values(TABLE_TABS).map((itemValue) => {
    const { id: tabId, value: tabValue } = itemValue;
    const tabData = allTabData[tabValue];

    const numberClasses = classNames(css.number, {
      [css.numberActive]: tabValue === currentTab,
    });

    const label = (
      <div className={css.tabItemContainer}>
        <span>{intl.formatMessage({ id: tabId })}</span>
        <div className={numberClasses}>{tabData.length}</div>
      </div>
    );

    let children = <></>;
    const initialParams = {
      tab: tabValue,
      tableHeads,
      onClickDeleteOrderItem: handleClickDeleteOrderItem,
      onClickEditOrderItem: handleClickEditOrderItem,
      data: tabData,
      deletedTabData,
      onRestoreMembers: handleRestoreMembers,
      onDeletePermanentlyMembers: handleDeletePermanentlyMembers,
    };

    switch (tabValue) {
      case EOrderDetailsTableTab.chose:
        children = (
          <>
            {tabData.length > 0 ? (
              <OrderDetailsTableComponent {...initialParams} />
            ) : (
              <p className={css.noChoices}>
                {intl.formatMessage({ id: 'OrderDetailsTable.noChoices' })}
              </p>
            )}
          </>
        );
        break;
      case EOrderDetailsTableTab.notChoose:
      case EOrderDetailsTableTab.notJoined:
        children = <OrderDetailsTableComponent {...initialParams} />;
        break;

      default:
        break;
    }

    return {
      id: tabId,
      label,
      children,
    };
  });
};
