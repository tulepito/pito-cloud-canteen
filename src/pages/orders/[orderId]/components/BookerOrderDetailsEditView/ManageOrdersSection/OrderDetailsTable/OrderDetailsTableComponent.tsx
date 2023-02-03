import IconDelete from '@components/Icons/IconDelete/IconDelete';
import IconEdit from '@components/Icons/IconEdit/IconEdit';
import { useAppSelector } from '@hooks/reduxHooks';
import { EParticipantOrderStatus } from '@utils/enums';
import type { TObject } from '@utils/types';
import classNames from 'classnames';
import { useState } from 'react';
import { useIntl } from 'react-intl';

import ManageDeletedListModal from '../ManageDeletedListModal';
import { isStranger } from './OrderDetailsTable.helpers';
import css from './OrderDetailsTable.module.scss';
import { EOrderDetailsTableTab } from './OrderDetailsTable.utils';

type TOrderDetailsTableComponentProps = {
  tab: EOrderDetailsTableTab;
  tableHeads: string[];
  data: TObject[];
  deletedTabData: TObject[];
  hasTotalLine?: boolean;
  onClickEditOrderItem: (tab: EOrderDetailsTableTab, id: string) => () => void;
  onClickDeleteOrderItem: (id: string) => () => void;
  onRestoreMembers: (memberIds: string[]) => void;
  onDeletePermanentlyMembers: (memberIds: string[]) => void;
};

export const OrderDetailsTableComponent: React.FC<
  TOrderDetailsTableComponentProps
> = ({
  tab,
  tableHeads,
  data,
  deletedTabData = [],
  onClickEditOrderItem,
  onClickDeleteOrderItem,
  onRestoreMembers,
  onDeletePermanentlyMembers,
}) => {
  const intl = useIntl();
  const [isManageDeletedModalOpen, setIsManageDeletedModalOpen] =
    useState(false);
  const participants = useAppSelector(
    (state) => state.OrderManagement.participantData,
  );

  const isDataEmpty = deletedTabData?.length === 0;
  const actionTdClasses = classNames(css.actionTd, {
    [css.actionTdDisabled]: isDataEmpty,
  });

  let totalText;

  switch (tab) {
    case EOrderDetailsTableTab.chose:
      totalText = intl.formatMessage({
        id: 'OrderDetailsTable.totalChose',
      });
      break;
    case EOrderDetailsTableTab.notChoose:
      totalText = intl.formatMessage({
        id: 'OrderDetailsTable.totalNotChose',
      });
      break;
    case EOrderDetailsTableTab.notJoined:
      totalText = intl.formatMessage({
        id: 'OrderDetailsTable.totalNotJoined',
      });
      break;
    default:
      break;
  }

  const handleClickViewDeletedList = () => {
    if (!isDataEmpty) setIsManageDeletedModalOpen(true);
  };
  const handleCloseDeletedList = () => {
    setIsManageDeletedModalOpen(false);
  };

  return (
    <>
      <ManageDeletedListModal
        isOpen={isManageDeletedModalOpen}
        onClose={handleCloseDeletedList}
        deletedTabData={deletedTabData}
        onRestoreMembers={onRestoreMembers}
        onDeletePermanentlyMembers={onDeletePermanentlyMembers}
      />
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
              foodData: { foodName = '', foodPrice = 0 },
              status,
            } = item;
            const {
              id: memberId,
              name: memberName,
              email: memberEmail,
            } = memberData || {};
            const formattedFoodPrice = `${foodPrice}đ`;
            const isStrange = isStranger(memberId, participants);

            const rowClasses = classNames({
              [css.notAllowed]: status === EParticipantOrderStatus.notAllowed,
            });

            return (
              <tr key={memberId} className={rowClasses}>
                <td title={memberName}>
                  <div>{memberName}</div>
                  {/* <div>Người dùng</div> */}
                  {isStrange && (
                    <div className={css.stranger}>
                      {intl.formatMessage({
                        id: 'OrderDetailsTableComponent.strangerText',
                      })}
                    </div>
                  )}
                </td>
                <td title={memberEmail}>{memberEmail}</td>
                <td title={foodName}>{foodName}</td>
                <td title={formattedFoodPrice}>{formattedFoodPrice}</td>
                <td>
                  <div>
                    <IconEdit
                      className={css.icon}
                      onClick={onClickEditOrderItem(tab, memberId)}
                    />
                    <IconDelete
                      className={css.icon}
                      onClick={onClickDeleteOrderItem(memberId)}
                    />
                  </div>
                </td>
              </tr>
            );
          })}

          <tr className={css.totalRow}>
            <td>{totalText}</td>
            <td>{data?.length}</td>
            <td></td>
            <td
              colSpan={2}
              onClick={handleClickViewDeletedList}
              className={actionTdClasses}>
              {intl.formatMessage({ id: 'OrderDetailsTable.viewDeletedList' })}
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
};
