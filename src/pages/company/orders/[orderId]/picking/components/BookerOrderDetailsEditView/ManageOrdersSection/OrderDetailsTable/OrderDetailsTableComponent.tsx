import { useState } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

import IconDelete from '@components/Icons/IconDelete/IconDelete';
import IconEdit from '@components/Icons/IconEdit/IconEdit';
import { parseThousandNumber } from '@helpers/format';
import { shortenString } from '@src/utils/string';
import { EParticipantOrderStatus } from '@utils/enums';
import type { TObject } from '@utils/types';

import ManageDeletedListModal from '../ManageDeletedListModal';

import type { TItemData } from './OrderDetailsTable.utils';
import { EOrderDetailsTableTab } from './OrderDetailsTable.utils';

import css from './OrderDetailsTable.module.scss';

const MAX_LENGTH_NAME = 16;
const MAX_LENGTH_EMAIL = 20;

type TOrderDetailsTableComponentProps = {
  tab: EOrderDetailsTableTab;
  tableHeads: string[];
  data: TItemData[];
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
          <tr>
            <td colSpan={5}>
              <div className={css.scrollContainer}>
                <table>
                  {data.map((item) => {
                    const { isAnonymous, memberData, foodData, status } = item;
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
                        <td title={formattedFoodPrice}>{formattedFoodPrice}</td>
                        <td>
                          <div className={css.actionCell}>
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
                </table>
              </div>
            </td>
          </tr>
          <tr className={css.totalRow}>
            <td>{totalText}</td>
            <td>{data?.length}</td>
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
