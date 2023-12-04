import { useIntl } from 'react-intl';
import classNames from 'classnames';

import RenderWhen from '@components/RenderWhen/RenderWhen';

import type { TAllTabData, TItemData } from './OrderDetailsTable.utils';
import { EOrderDetailsTableTab, TABLE_TABS } from './OrderDetailsTable.utils';
import OrderDetailsTableComponent from './OrderDetailsTableComponent';

import css from './OrderDetailsTable.module.scss';

type TUsePrepareTabItemsParams = {
  allTabData: TAllTabData;
  tableHeads: string[];
  deletedTabData: TItemData[];
  currentTab: EOrderDetailsTableTab;
  handleClickEditOrderItem: (
    tab: EOrderDetailsTableTab,
    memberId: string,
  ) => () => void;
  handleClickDeleteOrderItem: (
    tab: EOrderDetailsTableTab,
    memberId: string,
  ) => () => void;
  handleRestoreMembers: (memberIds: string[]) => void;
  handleDeletePermanentlyMembers: (memberIds: string[]) => void;
  ableToUpdateOrder: boolean;
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
  ableToUpdateOrder,
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
      tab: tabValue as Exclude<
        EOrderDetailsTableTab,
        EOrderDetailsTableTab.deleted
      >,
      tableHeads,
      onClickDeleteOrderItem: (memberId: string) =>
        handleClickDeleteOrderItem(tabValue, memberId),
      onClickEditOrderItem: handleClickEditOrderItem,
      data: tabData,
      deletedTabData,
      onRestoreMembers: handleRestoreMembers,
      onDeletePermanentlyMembers: handleDeletePermanentlyMembers,
      ableToUpdateOrder,
    };

    switch (tabValue) {
      case EOrderDetailsTableTab.chose:
        children = (
          <RenderWhen condition={tabData.length > 0}>
            <OrderDetailsTableComponent {...initialParams} />
            <RenderWhen.False>
              <p className={css.noChoices}>
                {intl.formatMessage({ id: 'OrderDetailsTable.noChoices' })}
              </p>
            </RenderWhen.False>
          </RenderWhen>
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
