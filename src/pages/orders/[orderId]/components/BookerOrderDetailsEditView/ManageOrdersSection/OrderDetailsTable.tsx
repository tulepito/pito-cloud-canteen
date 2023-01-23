import IconDelete from '@components/Icons/IconDelete/IconDelete';
import IconEdit from '@components/Icons/IconEdit/IconEdit';
import type { TTabsItem } from '@components/Tabs/Tabs';
import Tabs from '@components/Tabs/Tabs';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { EParticipantOrderStatus } from '@utils/enums';
import type { TObject, TUser } from '@utils/types';
import classNames from 'classnames';
import get from 'lodash/get';
import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import { orderManagementsThunks } from '../../../OrderManagement.slice';
import type { TEditOrderRowFormValues } from './EditOrderRowForm';
import EditOrderRowModal from './EditOrderRowModal';
import css from './OrderDetailsTable.module.scss';

enum EOrderDetailsTableTab {
  chose = 'chose',
  notChoose = 'notChoose',
  notJoin = 'notJoin',
}

const TABLE_TABS = {
  [EOrderDetailsTableTab.chose]: {
    id: 'OrderDetailsTable.tab.chose',
    value: EOrderDetailsTableTab.chose,
  },
  [EOrderDetailsTableTab.notChoose]: {
    id: 'OrderDetailsTable.tab.notChoose',
    value: EOrderDetailsTableTab.notChoose,
  },
  [EOrderDetailsTableTab.notJoin]: {
    id: 'OrderDetailsTable.tab.notJoin',
    value: EOrderDetailsTableTab.notJoin,
  },
};

const SELECTED_TABLE_HEAD_IDS = [
  'OrderDetailsTable.head.name',
  'OrderDetailsTable.head.email',
  'OrderDetailsTable.head.selectedFood',
  'OrderDetailsTable.head.price',
  // 'OrderDetailsTable.head.other',
];

type TActionCellContentProps = {
  onEdit: () => void;
  onDelete: () => void;
};

const ActionCellContent: React.FC<TActionCellContentProps> = ({
  onEdit,
  onDelete,
}) => {
  return (
    <div>
      <IconEdit className={css.icon} onClick={onEdit} />
      <IconDelete className={css.icon} onClick={onDelete} />
    </div>
  );
};

type TOrderDetailsTableProps = {
  currentViewDate: number;
  foodOptions: {
    foodId: string;
    foodName: string;
  }[];
};

const prepareDataForTab = ({
  participantData,
  memberOrders,
  foodList,
}: any) => {
  const memberOrderList = Object.entries(memberOrders);

  const memberInfoMap = participantData.reduce(
    (result: TObject, currentParticipant: TUser) => {
      const {
        id: { uuid },
        attributes: {
          email,
          profile: { displayName },
        },
      } = currentParticipant;

      return { ...result, [uuid]: { email, name: displayName, id: uuid } };
    },
    {},
  );

  const data = memberOrderList.reduce(
    (result: TObject, currentOrderItem) => {
      const {
        chose: choseList,
        notChoose: notChooseList,
        notJoin: notJoinedList,
      } = result;

      const [memberId, orderItemData] = currentOrderItem;
      const { status, foodId } = orderItemData as TObject;
      const memberData = memberInfoMap[memberId];

      const rowData = {
        memberData,
        status,
        foodData:
          foodId?.length > 0 && foodList[foodId]
            ? { ...foodList[foodId], foodId }
            : {},
      };

      switch (status) {
        case EParticipantOrderStatus.joined:
          return { ...result, chose: [...choseList, rowData] };
        case EParticipantOrderStatus.notAllowed: {
          if (foodId === '') {
            return { ...result, notChoose: [...notChooseList, rowData] };
          }
          return { ...result, chose: [...choseList, rowData] };
        }
        case EParticipantOrderStatus.empty:
        case EParticipantOrderStatus.expired:
          return { ...result, notChoose: [...notChooseList, rowData] };
        case EParticipantOrderStatus.notJoined:
          return { ...result, notJoin: [...notJoinedList, rowData] };
        default:
          return result;
      }
    },
    {
      [EOrderDetailsTableTab.chose]: [],
      [EOrderDetailsTableTab.notChoose]: [],
      [EOrderDetailsTableTab.notJoin]: [],
    },
  );

  return data;
};

const renderTableLayout = ({
  tab,
  tableHeads,
  data,
  handleClickEditOrderItem,
  handleClickDeleteOrderItem,
  hasTotalLine = false,
}: {
  tab: EOrderDetailsTableTab;
  tableHeads: string[];
  data: TObject[];
  hasTotalLine?: boolean;
  handleClickEditOrderItem: (
    tab: EOrderDetailsTableTab,
    id: string,
  ) => () => void;
  handleClickDeleteOrderItem: (id: string) => () => void;
}) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const intl = useIntl();

  return (
    <table className={css.tableRoot}>
      <thead>
        <tr>
          {tableHeads.map((head: string, index: number) => (
            <th key={index} colSpan={index === 3 ? 2 : 1}>
              {head}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item: TObject) => {
          const {
            memberData,
            foodData: { foodName = '', foodPrice = '' },
            status,
          } = item;
          const {
            id: memberId,
            name: memberName,
            email: memberEmail,
          } = memberData || {};

          const formattedFoodPrice =
            typeof foodPrice === 'number'
              ? `${foodPrice}đ`
              : foodPrice?.length > 0
              ? `${foodPrice}đ`
              : '';
          const rowClasses = classNames({
            [css.notAllowed]: status === EParticipantOrderStatus.notAllowed,
          });

          return (
            <tr key={memberId} className={rowClasses}>
              <td title={memberName}>
                <div>{memberName}</div>
                {/* <div>Người dùng</div> */}
                {/* <div>Ngoài nhóm</div> */}
              </td>
              <td title={memberEmail}>{memberEmail}</td>
              <td title={foodName}>{foodName}</td>
              <td title={formattedFoodPrice}>{formattedFoodPrice}</td>
              <td>
                <ActionCellContent
                  onEdit={handleClickEditOrderItem(tab, memberId)}
                  onDelete={handleClickDeleteOrderItem(memberId)}
                />
              </td>
            </tr>
          );
        })}

        {hasTotalLine && (
          <tr className={css.totalRow}>
            <td>
              {intl.formatMessage({
                id: 'OrderDetailsTable.totalChoices',
              })}
            </td>
            <td>{data?.length}</td>
          </tr>
        )}
      </tbody>
    </table>
  );
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

  const allTabData: TObject = useMemo(
    () =>
      prepareDataForTab({
        participantData,
        memberOrders,
        foodList,
      }),
    [participantData, memberOrders, foodList],
  );
  const selectedTabData = allTabData[EOrderDetailsTableTab.chose];
  const notChoseTabData = allTabData[EOrderDetailsTableTab.notChoose];

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

    dispatch(orderManagementsThunks.disallowMember(updateValues));
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

    await dispatch(orderManagementsThunks.addOrUpdateMemberOrder(updateValues));
    setIsEditSelectionModalOpen(false);
  };

  const tableHeads = useMemo(
    () => SELECTED_TABLE_HEAD_IDS.map((id) => intl.formatMessage({ id })),
    [],
  );

  const tabItems = Object.values(TABLE_TABS).map((itemValue) => {
    const { id: tabId, value: tabValue } = itemValue;

    const numberClasses = classNames(css.number, {
      [css.numberActive]: tabId === currentTab,
    });

    const label = (
      <div className={css.tabItemContainer}>
        <span>{intl.formatMessage({ id: tabId })}</span>
        <div className={numberClasses}>{allTabData[tabValue].length}</div>
      </div>
    );

    let children = <></>;

    switch (tabValue) {
      case EOrderDetailsTableTab.chose:
        children = (
          <>
            {selectedTabData?.length > 0 ? (
              <>
                {renderTableLayout({
                  tab: tabValue,
                  tableHeads,
                  data: selectedTabData,
                  handleClickDeleteOrderItem,
                  handleClickEditOrderItem,
                  hasTotalLine: true,
                })}
              </>
            ) : (
              <p className={css.noChoices}>
                {intl.formatMessage({ id: 'OrderDetailsTable.noChoices' })}
              </p>
            )}
          </>
        );
        break;
      case EOrderDetailsTableTab.notChoose:
        children = (
          <>
            {notChoseTabData?.length > 0 ? (
              <>
                {renderTableLayout({
                  tab: tabValue,
                  tableHeads,
                  data: notChoseTabData,
                  handleClickDeleteOrderItem,
                  handleClickEditOrderItem,
                })}
              </>
            ) : (
              <p className={css.noChoices}>
                {intl.formatMessage({ id: 'OrderDetailsTable.noChoices' })}
              </p>
            )}
          </>
        );
        break;
      case EOrderDetailsTableTab.notJoin:
        children = (
          <p className={css.noChoices}>
            {intl.formatMessage({ id: 'OrderDetailsTable.noChoices' })}
          </p>
        );
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
