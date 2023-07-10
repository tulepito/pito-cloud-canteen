import { useState } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

import IconDelete from '@components/Icons/IconDelete/IconDelete';
import IconEdit from '@components/Icons/IconEdit/IconEdit';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { parseThousandNumber } from '@helpers/format';
import { useAppSelector } from '@hooks/reduxHooks';
import { orderDetailsAnyActionsInProgress } from '@redux/slices/OrderManagement.slice';
import { shortenString } from '@src/utils/string';
import { EParticipantOrderStatus } from '@utils/enums';
import type { TObject } from '@utils/types';

import ManageDeletedListModal from '../DeletedOrderDetails/ManageDeletedListModal';

import type { TItemData } from './OrderDetailsTable.utils';
import { EOrderDetailsTableTab } from './OrderDetailsTable.utils';

import css from './OrderDetailsTable.module.scss';

const MAX_LENGTH_NAME = 15;
const MAX_LENGTH_EMAIL = 20;

const totalTabIdByTabName: TObject<
  Exclude<EOrderDetailsTableTab, EOrderDetailsTableTab.deleted>,
  string
> = {
  [EOrderDetailsTableTab.chose]: 'OrderDetailsTable.totalChose',
  [EOrderDetailsTableTab.notChoose]: 'OrderDetailsTable.totalNotChose',
  [EOrderDetailsTableTab.notJoined]: 'OrderDetailsTable.totalNotJoined',
};

type TOrderDetailsTableComponentProps = {
  tab: Exclude<EOrderDetailsTableTab, EOrderDetailsTableTab.deleted>;
  tableHeads: string[];
  data: TItemData[];
  deletedTabData: TObject[];
  hasTotalLine?: boolean;
  onClickEditOrderItem: (tab: EOrderDetailsTableTab, id: string) => () => void;
  onClickDeleteOrderItem: (memberId: string) => () => void;
  onRestoreMembers: (memberIds: string[]) => void;
  onDeletePermanentlyMembers: (memberIds: string[]) => void;
  ableToUpdateOrder: boolean;
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
  ableToUpdateOrder,
}) => {
  const intl = useIntl();
  const [isManageDeletedModalOpen, setIsManageDeletedModalOpen] =
    useState(false);
  const inProgress = useAppSelector(orderDetailsAnyActionsInProgress);

  const actionDisabled = inProgress;
  const isDataEmpty = deletedTabData?.length === 0;
  const actionTdClasses = classNames(css.actionTd, {
    [css.actionTdDisabled]: isDataEmpty,
  });

  const totalText = intl.formatMessage({
    id: totalTabIdByTabName[tab],
  });

  const handleClickViewDeletedList = () => {
    if (!isDataEmpty) setIsManageDeletedModalOpen(true);
  };
  const handleCloseDeletedList = () => {
    setIsManageDeletedModalOpen(false);
  };

  const doNothing = () => {};

  return (
    <>
      <ManageDeletedListModal
        isOpen={isManageDeletedModalOpen}
        onClose={handleCloseDeletedList}
        deletedTabData={deletedTabData}
        onRestoreMembers={onRestoreMembers}
        onDeletePermanentlyMembers={onDeletePermanentlyMembers}
        disabled={!ableToUpdateOrder}
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
          <tr>
            <td colSpan={5}>
              <div className={css.scrollContainer}>
                <table>
                  <tbody>
                    {data.map((item) => {
                      const { isAnonymous, memberData, foodData, status } =
                        item;
                      const { foodName = '', foodPrice = 0 } = foodData;

                      const {
                        id: memberId,
                        name: memberName,
                        email: memberEmail,
                      } = memberData || {};
                      const formattedFoodPrice = `${parseThousandNumber(
                        foodPrice,
                      )}đ`;

                      const rowClasses = classNames({
                        [css.notAllowed]:
                          status === EParticipantOrderStatus.notAllowed,
                      });

                      return (
                        <tr key={memberId} className={rowClasses}>
                          <td title={memberName}>
                            <div>
                              {shortenString(memberName, MAX_LENGTH_NAME)}
                            </div>
                            {/* <div>Người dùng</div> */}
                            {isAnonymous && (
                              <div className={css.stranger}>
                                {intl.formatMessage({
                                  id: 'OrderDetailsTableComponent.strangerText',
                                })}
                              </div>
                            )}
                          </td>
                          <td title={memberEmail}>
                            {shortenString(memberEmail, MAX_LENGTH_EMAIL)}
                          </td>
                          <td title={foodName}>{foodName}</td>
                          <td>
                            <RenderWhen condition={Number(foodPrice) > 0}>
                              <>{formattedFoodPrice}</>
                            </RenderWhen>
                          </td>
                          <td>
                            {ableToUpdateOrder && (
                              <div className={css.actionCell}>
                                <IconEdit
                                  className={css.icon}
                                  onClick={
                                    actionDisabled
                                      ? doNothing
                                      : onClickEditOrderItem(tab, memberId)
                                  }
                                />
                                <IconDelete
                                  className={css.icon}
                                  onClick={
                                    actionDisabled
                                      ? doNothing
                                      : onClickDeleteOrderItem(memberId)
                                  }
                                />
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </td>
          </tr>
          <tr className={css.totalRow}>
            <td colSpan={2}>
              <span className={css.totalText}>{totalText}</span>
              <span>{data?.length}</span>
            </td>
            <td></td>
            <td
              colSpan={2}
              onClick={handleClickViewDeletedList}
              className={actionTdClasses}>
              {intl.formatMessage({
                id: 'OrderDetailsTable.viewDeletedList',
              })}
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
};
