import type { TTabsItem } from '@components/Tabs/Tabs';
import Tabs from '@components/Tabs/Tabs';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { orderManagementThunks } from '@pages/orders/[orderId]/OrderManagement.slice';
import { Listing } from '@utils/data';
import type { TListing, TObject } from '@utils/types';
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
import { usePrepareTabItems } from './usePrepareTabItems';

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
  const { packagePerMember = 0 } = Listing(orderData as TListing).getMetadata();
  const { orderDetail = {} } = Listing(planData as TListing).getMetadata();

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

  const tabItems = usePrepareTabItems({
    allTabData,
    tableHeads,
    deletedTabData,
    currentTab,
    handleClickEditOrderItem,
    handleClickDeleteOrderItem,
    handleRestoreMembers,
    handleDeletePermanentlyMembers,
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
