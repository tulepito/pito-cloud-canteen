import type { TTabsItem } from '@components/Tabs/Tabs';
import Tabs from '@components/Tabs/Tabs';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { orderManagementThunks } from '@pages/orders/[orderId]/OrderManagement.slice';
import type { TObject } from '@utils/types';
import classNames from 'classnames';
import get from 'lodash/get';
import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import type { TEditOrderRowFormValues } from '../EditOrderRowForm';
import EditOrderRowModal from '../EditOrderRowModal';
import { prepareDataForTabs } from './OrderDetailsTable.helpers';
import css from './OrderDetailsTable.module.scss';
import type { TAllTabData } from './OrderDetailsTable.utils';
import {
  EOrderDetailsTableTab,
  SELECTED_TABLE_HEAD_IDS,
  TABLE_TABS,
} from './OrderDetailsTable.utils';
import { OrderDetailsTableComponent } from './OrderDetailsTableComponent';

type TOrderDetailsTableProps = {
  currentViewDate: number;
  foodOptions: {
    foodId: string;
    foodName: string;
  }[];
};

const OrderDetailsTable: React.FC<TOrderDetailsTableProps> = (props) => {
  const { currentViewDate, foodOptions } = props;
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const [currentTab, setCurrentTab] = useState(
    TABLE_TABS[EOrderDetailsTableTab.chose].value,
  );
  const [currentMemberOrderData, setCurrentMemberOrderData] = useState<TObject>(
    {},
  );
  const [isEditSelectionModalOpen, setIsEditSelectionModalOpen] =
    useState(false);
  const { planData, participantData, orderData } = useAppSelector(
    (state) => state.OrderManagement,
  );
  const packagePerMember = get(
    orderData,
    'attributes.metadata.generalInfo.packagePerMember',
    0,
  );
  const orderDetail = get(planData, 'attributes.metadata.orderDetail', {});
  const { foodList = {}, memberOrders = {} } =
    orderDetail[currentViewDate.toString()] || {};

  const allTabData: TAllTabData = useMemo(
    () =>
      prepareDataForTabs({
        participantData,
        memberOrders,
        foodList,
      }),
    [participantData, memberOrders, foodList],
  );
  const deletedTabData = allTabData[EOrderDetailsTableTab.deleted];

  const handleClickEditOrderItem =
    (tab: EOrderDetailsTableTab, memberId: string) => () => {
      const memberOrderData =
        allTabData[tab].find(
          (item: TObject) => item.memberData.id === memberId,
        ) || {};

      setCurrentMemberOrderData(memberOrderData);
      setIsEditSelectionModalOpen(true);
    };

  const handleClickDeleteOrderItem = (memberId: string) => () => {
    const updateValues = {
      memberId,
      currentViewDate,
    };

    dispatch(orderManagementThunks.disallowMember(updateValues));
  };

  const handleCloseEditSelectionModal = () => {
    setIsEditSelectionModalOpen(false);
  };
  const handleSubmitEditSelectionModal = async (
    values: TEditOrderRowFormValues,
  ) => {
    const { foodId, requirement } = values;
    const { memberData } = currentMemberOrderData;

    const updateValues = {
      memberId: memberData?.id,
      foodId,
      requirement: requirement || '',
      currentViewDate,
    };

    await dispatch(orderManagementThunks.addOrUpdateMemberOrder(updateValues));
    setIsEditSelectionModalOpen(false);
  };

  const handleRestoreMembers = async (memberIds: string[]) => {
    await dispatch(
      orderManagementThunks.restoredDisAllowedMember({
        currentViewDate,
        memberIds,
      }),
    );
  };
  const handleDeletePermanentlyMembers = async (memberIds: string[]) => {
    await dispatch(
      orderManagementThunks.deleteDisAllowedMember({
        currentViewDate,
        memberIds,
      }),
    );
  };

  const tableHeads = useMemo(
    () => SELECTED_TABLE_HEAD_IDS.map((id) => intl.formatMessage({ id })),
    [],
  );

  const tabItems = Object.values(TABLE_TABS).map((itemValue) => {
    const { id: tabId, value: tabValue } = itemValue;
    const tabData = allTabData[tabValue];

    const numberClasses = classNames(css.number, {
      [css.numberActive]: tabId === currentTab,
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
        children = <OrderDetailsTableComponent {...initialParams} />;
        break;
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

  const handleTabChange = ({ id }: TTabsItem) => {
    setCurrentTab(id as EOrderDetailsTableTab);
  };

  return (
    <div className={css.root}>
      <div>
        <Tabs items={tabItems} onChange={handleTabChange} />
        <EditOrderRowModal
          isOpen={isEditSelectionModalOpen}
          onClose={handleCloseEditSelectionModal}
          onSubmit={handleSubmitEditSelectionModal}
          foodOptions={foodOptions}
          packagePerMember={packagePerMember}
          currentMemberOrderData={currentMemberOrderData}
        />
      </div>
    </div>
  );
};

export default OrderDetailsTable;
