import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import compact from 'lodash/compact';
import difference from 'lodash/difference';
import isEmpty from 'lodash/isEmpty';

import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconDelete from '@components/Icons/IconDelete/IconDelete';
import IconEdit from '@components/Icons/IconEdit/IconEdit';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { parseThousandNumber } from '@helpers/format';
import { useAppSelector } from '@hooks/reduxHooks';
import { useViewport } from '@hooks/useViewport';
import type { RestoreDraftDisAllowedMemberPayload } from '@redux/slices/OrderManagement.slice';
import { orderDetailsAnyActionsInProgress } from '@redux/slices/OrderManagement.slice';
import { EParticipantOrderStatus } from '@utils/enums';
import type { TObject } from '@utils/types';

import ManageDeletedListModal from '../DeletedOrderDetails/ManageDeletedListModal';

import type { TItemData } from './OrderDetailsTable.utils';
import { EOrderDetailsTableTab } from './OrderDetailsTable.utils';

import css from './OrderDetailsTable.module.scss';

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
  onRestoreMembers: (
    memberIds: RestoreDraftDisAllowedMemberPayload['members'],
  ) => void;
  onDeletePermanentlyMembers: (memberIds: string[]) => void;
  ableToUpdateOrder: boolean;
};

const OrderDetailsTableComponent: React.FC<
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
  const { isMobileLayout } = useViewport();
  const [expandingStatusMap, setExpandingStatusMap] = useState<any>({});
  const [isManageDeletedModalOpen, setIsManageDeletedModalOpen] =
    useState(false);
  const inProgress = useAppSelector(orderDetailsAnyActionsInProgress);

  const allParticipantIds = compact(
    data.concat(deletedTabData as any).map(({ memberData }) => memberData?.id),
  );
  const missingIds = difference(
    allParticipantIds,
    Object.keys(expandingStatusMap),
  );
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

  const toggleCollapseStatus = (id: string) => () => {
    setExpandingStatusMap({
      ...expandingStatusMap,
      [id]: !expandingStatusMap[id],
    });
  };

  useEffect(() => {
    if (!isEmpty(missingIds)) {
      const updateObject = missingIds.reduce((result: any, id: string) => {
        if (typeof result[id] === 'undefined') {
          result[id] = false;
        }

        return result;
      }, expandingStatusMap);
      setExpandingStatusMap(updateObject);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(missingIds)]);

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
                <span>{head} </span>
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
                      const hasFoodPrice = Number(foodPrice) > 0;
                      const formattedFoodPrice = `${parseThousandNumber(
                        foodPrice,
                      )}đ`;

                      const isExpanding = expandingStatusMap[memberId];

                      const rowClasses = classNames({
                        [css.notAllowed]:
                          status === EParticipantOrderStatus.notAllowed,
                      });

                      const memberNameComponent = (
                        <RenderWhen condition={!isAnonymous}>
                          <div className={css.memberName}>{memberName}</div>

                          <RenderWhen.False>
                            <div>
                              <div className={css.memberNameWithAnonymous}>
                                {memberName}
                              </div>
                              <div className={css.stranger}>
                                {intl.formatMessage({
                                  id: 'OrderDetailsTableComponent.strangerText',
                                })}
                              </div>
                            </div>
                          </RenderWhen.False>
                        </RenderWhen>
                      );

                      const foodNameClasses = classNames(css.foodName, {
                        [css.foodNameWithAnonymous]: isAnonymous,
                      });
                      const foodNameComponent = (
                        <div className={foodNameClasses}>{foodName}</div>
                      );

                      const iconEditComponent = (
                        <IconEdit
                          className={css.icon}
                          onClick={
                            actionDisabled
                              ? doNothing
                              : onClickEditOrderItem(tab, memberId)
                          }
                        />
                      );
                      const iconDeleteComponent = (
                        <IconDelete
                          className={css.icon}
                          onClick={
                            actionDisabled
                              ? doNothing
                              : onClickDeleteOrderItem(memberId)
                          }
                        />
                      );
                      const actionIconComponents = isMobileLayout ? (
                        <div className={css.iconsContainer}>
                          <div className={css.iconContainer}>
                            {iconEditComponent}
                          </div>
                          <div className={css.iconContainer}>
                            {iconDeleteComponent}
                          </div>
                        </div>
                      ) : (
                        <>
                          {iconEditComponent}
                          {iconDeleteComponent}
                        </>
                      );

                      return (
                        <tr key={memberId} className={rowClasses}>
                          <td title={memberName}>
                            <RenderWhen condition={isMobileLayout}>
                              <div className={css.mobileNameContainer}>
                                {memberNameComponent}

                                <RenderWhen condition={isExpanding}>
                                  <div className={css.grayLabel}>Email</div>
                                  <RenderWhen condition={hasFoodPrice}>
                                    <div className={css.grayLabel}>Đơn giá</div>
                                  </RenderWhen>
                                </RenderWhen>
                              </div>

                              <RenderWhen.False>
                                {memberNameComponent}
                              </RenderWhen.False>
                            </RenderWhen>
                          </td>
                          <td title={memberEmail}>{memberEmail}</td>
                          <td title={foodName}>
                            <RenderWhen condition={isMobileLayout}>
                              <div className={css.mobileNameContainer}>
                                <div className={css.foodNameWithAction}>
                                  {foodNameComponent}
                                  <IconArrow
                                    onClick={toggleCollapseStatus(memberId)}
                                    direction={isExpanding ? 'up' : 'down'}
                                  />
                                </div>
                                <RenderWhen condition={isExpanding}>
                                  <div className={css.memberEmail}>
                                    {memberEmail}
                                  </div>
                                  <RenderWhen condition={hasFoodPrice}>
                                    <div>{formattedFoodPrice}</div>
                                  </RenderWhen>
                                  <RenderWhen condition={ableToUpdateOrder}>
                                    {actionIconComponents}
                                  </RenderWhen>
                                </RenderWhen>
                              </div>

                              <RenderWhen.False>
                                {foodNameComponent}
                              </RenderWhen.False>
                            </RenderWhen>
                          </td>
                          <td>
                            <RenderWhen condition={Number(foodPrice) > 0}>
                              {formattedFoodPrice}
                            </RenderWhen>
                          </td>
                          <td>
                            <RenderWhen condition={ableToUpdateOrder}>
                              <div
                                className={classNames(css.actionCell, 'flex')}>
                                {actionIconComponents}
                              </div>
                            </RenderWhen>
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

export default OrderDetailsTableComponent;
