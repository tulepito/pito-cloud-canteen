import { useEffect, useState } from 'react';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';

import type { TTabsItem } from '@components/Tabs/Tabs';
import Tabs from '@components/Tabs/Tabs';
import { historyPushState } from '@helpers/urlHelpers';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import {
  orderDetailsAnyActionsInProgress,
  OrderManagementsAction,
  orderManagementThunks,
} from '@redux/slices/OrderManagement.slice';
import type { TObject } from '@utils/types';

import AlertConfirmDeleteParticipant from '../../ManageParticipantsSection/AlertConfirmDeleteParticipant';
import type { TEditOrderRowFormValues } from '../AddOrEditOrderDetail/EditOrderRowForm';
import EditOrderRowModal from '../AddOrEditOrderDetail/EditOrderRowModal';
import { usePrepareOrderDetailTableData } from '../hooks/usePrepareOrderDetailTableData';

import { EOrderDetailsTableTab, TABLE_TABS } from './OrderDetailsTable.utils';
import { usePrepareTabItems } from './usePrepareTabItems';

const tableTabList = Object.values(TABLE_TABS);

const findTabByValueOrId = (tabId: string) => {
  const index = tableTabList.findIndex(
    ({ value, id }) => value === tabId || id === tabId,
  );

  return index > -1 ? { tab: tableTabList[index], index } : { index };
};

type TOrderDetailsTableProps = {
  currentViewDate: number;
  foodOptions: {
    foodId: string;
    foodName: string;
  }[];
  ableToUpdateOrder: boolean;
  isDraftEditing: boolean;
  handleOpenReachMaxAllowedChangesModal?: (type: string) => void;
  isAdminFlow?: boolean;
};

const OrderDetailsTable: React.FC<TOrderDetailsTableProps> = (props) => {
  const {
    currentViewDate,
    foodOptions,
    ableToUpdateOrder,
    isDraftEditing,
    isAdminFlow = false,
  } = props;
  const {
    query: { tab: tabId },
  } = useRouter();
  const dispatch = useAppDispatch();
  const [defaultActiveKey, setDefaultActiveKey] = useState(1);
  const [currentTab, setCurrentTab] = useState(
    TABLE_TABS[EOrderDetailsTableTab.chose].value,
  );
  const [currentMemberOrderData, setCurrentMemberOrderData] = useState<TObject>(
    {},
  );
  const [isEditSelectionModalOpen, setIsEditSelectionModalOpen] =
    useState(false);
  const [wannaDeleteMember, setWannaDeleteMember] = useState<TObject>({});
  const {
    value: isDeleteParticipantModalOpen,
    setFalse: turnOffDeleteParticipantModalOpen,
    setTrue: turnOnDeleteParticipantModalOpen,
  } = useBoolean();
  const inProgress = useAppSelector(orderDetailsAnyActionsInProgress);

  const { tableHeads, packagePerMember, allTabData, deletedTabData } =
    usePrepareOrderDetailTableData(currentViewDate);

  const handleClickEditOrderItem =
    (tab: EOrderDetailsTableTab, memberId: string) => () => {
      const memberOrderData =
        allTabData[tab].find(
          (item: TObject) => item.memberData.id === memberId,
        ) || {};

      setCurrentMemberOrderData(memberOrderData);
      setIsEditSelectionModalOpen(true);
    };

  const handleClickDeleteOrderItem =
    (tab: EOrderDetailsTableTab, memberId: string) => () => {
      const memberOrderData =
        allTabData[tab].find((item: TObject) => item.memberData.id === memberId)
          ?.memberData || {};

      turnOnDeleteParticipantModalOpen();

      setWannaDeleteMember({ ...memberOrderData, tab });
    };

  const handleCancelDeleteOrderItem = () => {
    turnOffDeleteParticipantModalOpen();
  };

  const handleConfirmDeleteOrderItem = () => {
    turnOffDeleteParticipantModalOpen();

    const updateValues = {
      memberId: wannaDeleteMember?.id,
      memberEmail: wannaDeleteMember?.email,
      currentViewDate,
      tab: wannaDeleteMember.tab,
      isAdminFlow,
    };

    if (isDraftEditing) {
      return dispatch(OrderManagementsAction.draftDisallowMember(updateValues));
    }

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
      memberEmail: memberData?.email,
      isAdminFlow,
    };

    if (isDraftEditing) {
      setIsEditSelectionModalOpen(false);

      return dispatch(
        OrderManagementsAction.updateDraftOrderDetail(updateValues),
      );
    }

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

  const tabItems = usePrepareTabItems({
    allTabData,
    tableHeads,
    deletedTabData,
    currentTab,
    handleClickEditOrderItem,
    handleClickDeleteOrderItem,
    handleRestoreMembers,
    handleDeletePermanentlyMembers,
    ableToUpdateOrder,
  });

  const handleTabChange = ({ id }: TTabsItem) => {
    const { tab } = findTabByValueOrId(id as string);
    const tabValue = tab?.value;

    setCurrentTab(tabValue as EOrderDetailsTableTab);
    historyPushState('tab', tabValue!);
  };

  useEffect(() => {
    if (!isEmpty(tabId)) {
      const { tab, index } = findTabByValueOrId(tabId as string);

      if (index > -1) {
        setCurrentTab(tab?.value as EOrderDetailsTableTab);
        setDefaultActiveKey(index + 1);
      }
    }
  }, [JSON.stringify(tabId)]);

  return (
    <>
      <Tabs
        disabled={inProgress}
        items={tabItems}
        onChange={handleTabChange}
        defaultActiveKey={defaultActiveKey.toString()}
      />
      <AlertConfirmDeleteParticipant
        isOpen={isDeleteParticipantModalOpen}
        onClose={turnOffDeleteParticipantModalOpen}
        onCancel={handleCancelDeleteOrderItem}
        onConfirm={handleConfirmDeleteOrderItem}
      />
      <EditOrderRowModal
        isOpen={isEditSelectionModalOpen}
        onClose={handleCloseEditSelectionModal}
        onSubmit={handleSubmitEditSelectionModal}
        foodOptions={foodOptions}
        packagePerMember={packagePerMember}
        currentMemberOrderData={currentMemberOrderData}
      />
    </>
  );
};

export default OrderDetailsTable;
