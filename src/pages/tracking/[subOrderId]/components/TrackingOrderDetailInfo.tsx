import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

import Collapsible from '@components/Collapsible/Collapsible';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { groupPickingOrderByFood } from '@helpers/order/orderDetailHelper';
import { useAppSelector } from '@hooks/reduxHooks';
import { Listing } from '@src/utils/data';
import { EOrderType } from '@src/utils/enums';
import type { TListing, TObject } from '@src/utils/types';

import css from './TrackingOrderDetailInfo.module.scss';

type TTrackingOrderDetailInfoProps = { subOrderDate: number | string };

const TrackingOrderDetailInfo: React.FC<TTrackingOrderDetailInfoProps> = ({
  subOrderDate,
}) => {
  const intl = useIntl();
  const order = useAppSelector((state) => state.TrackingPage.order);

  const {
    orderDetailOfDate = {},
    participants = [],
    anonymous = [],
  } = order || {};

  const orderGetter = Listing(order as TListing);
  const { orderType = EOrderType.group } = orderGetter.getMetadata();
  const { lineItems = [] } = orderDetailOfDate;
  const isGroupOrder = orderType === EOrderType.group;

  // Prepare data for order with type 'group'
  const [data] = groupPickingOrderByFood({
    orderDetail: {
      [subOrderDate]: orderDetailOfDate,
    },
    date: subOrderDate ? Number(subOrderDate) : undefined,
    participants,
    anonymous,
  }) || [{}];
  const { foodDataList = [] } = data || {};
  const initialCollapseStates = Array.from({
    length: foodDataList?.length,
  }).fill(0);
  const [isCollapsed, setIsCollapsed] = useState(initialCollapseStates);
  const totalFood = (isGroupOrder ? foodDataList : lineItems).reduce(
    (total: number, { frequency = 1, quantity = 1 }: TObject) => {
      return total + (isGroupOrder ? frequency : quantity);
    },
    0,
  );
  const handleClickGroupTitle = (idx: number) => () => {
    const changeValue = !isCollapsed[idx];

    const newState = isCollapsed.map((i, currIdx) => {
      if (currIdx !== idx) {
        return i;
      }

      return changeValue;
    });

    setIsCollapsed(newState);
  };

  useEffect(() => {
    setIsCollapsed(
      Array.from({
        length: foodDataList?.length,
      }).fill(0),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(foodDataList)]);

  return (
    <Collapsible
      className={css.root}
      label={intl.formatMessage({
        id: 'Tracking.OrderDetailInfo.title',
      })}>
      <div className={css.tableContainer}>
        <div className={css.tableHead}>
          <div>
            {intl.formatMessage({
              id: 'Tracking.OrderDetailInfo.tableHead.no',
            })}
          </div>
          <div>
            {intl.formatMessage({
              id: 'Tracking.OrderDetailInfo.tableHead.type',
            })}
          </div>
          <div>
            {intl.formatMessage({
              id: 'Tracking.OrderDetailInfo.tableHead.quantity',
            })}
          </div>

          <div></div>
        </div>

        <div className={css.tableBody}>
          <div className={css.totalFoodRow}>
            <div></div>
            <div></div>
            <div>{totalFood}</div>
            <div></div>
          </div>
          <RenderWhen condition={isGroupOrder}>
            {foodDataList?.map((foodData: TObject, foodIndex: number) => {
              const { foodName, frequency, notes } = foodData;

              const groupTitleClasses = classNames(css.groupTitle, {
                [css.collapsed]: isCollapsed[foodIndex],
              });
              const rowsClasses = classNames(css.rows, {
                [css.collapsed]: isCollapsed[foodIndex],
              });
              const iconClasses = classNames({
                [css.reversed]: isCollapsed[foodIndex],
              });

              return (
                <div className={css.tableRowGroup} key={foodIndex}>
                  <div className={groupTitleClasses}>
                    <div>{foodIndex + 1}</div>
                    <div>{foodName}</div>
                    <div>{frequency}</div>

                    <div
                      className={css.actionCell}
                      onClick={handleClickGroupTitle(foodIndex)}>
                      <IconArrow className={iconClasses} />
                    </div>
                  </div>
                  <div className={rowsClasses}>
                    {notes.map(({ note, name }: TObject, noteIndex: number) => {
                      return (
                        <div className={css.row} key={noteIndex}>
                          <div>
                            {foodIndex + 1}.{noteIndex + 1}
                          </div>
                          <div>{name}</div>
                          <div title={note}>{note || '-'}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <RenderWhen.False>
              {lineItems?.map((lineItem: TObject, foodIndex: number) => {
                const { name: foodName, quantity: frequency } = lineItem;

                return (
                  <div className={css.tableRowGroup} key={foodIndex}>
                    <div className={css.lineItemRow}>
                      <div>{foodIndex + 1}</div>
                      <div>{foodName}</div>
                      <div>{frequency}</div>
                      <div></div>
                    </div>
                  </div>
                );
              })}
            </RenderWhen.False>
          </RenderWhen>
        </div>
      </div>
    </Collapsible>
  );
};

export default TrackingOrderDetailInfo;
