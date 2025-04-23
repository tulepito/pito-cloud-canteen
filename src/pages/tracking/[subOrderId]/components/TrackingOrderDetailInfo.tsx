import { Fragment, useState } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table';
import { groupPickingOrderByFood } from '@helpers/order/orderDetailHelper';
import { useAppSelector } from '@hooks/reduxHooks';
import { Listing } from '@src/utils/data';
import { EOrderType } from '@src/utils/enums';
import type { TListing, TObject } from '@src/utils/types';

type TTrackingOrderDetailInfoProps = { subOrderDate: number | string };

const TrackingOrderDetailInfo: React.FC<TTrackingOrderDetailInfoProps> = ({
  subOrderDate,
}) => {
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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[48px]">STT</TableHead>
          <TableHead>Danh mục</TableHead>
          <TableHead>SL</TableHead>
          <TableHead>{/* Action */}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow className="bg-neutral-700 hover:bg-neutral-700">
          <TableCell></TableCell>
          <TableCell></TableCell>
          <TableCell className="font-bold text-lg text-white">
            {totalFood}
          </TableCell>
          <TableCell></TableCell>
        </TableRow>
        {isGroupOrder && (
          <>
            {foodDataList?.map((foodData: TObject, foodIndex: number) => {
              const { foodName, frequency, notes } = foodData;
              const isCollapsedFood = isCollapsed[foodIndex];

              return (
                <Fragment key={foodIndex}>
                  <TableRow
                    className="bg-neutral-200 hover:bg-neutral-200 cursor-pointer"
                    onClick={handleClickGroupTitle(foodIndex)}>
                    <TableCell>{foodIndex + 1}</TableCell>
                    <TableCell className="font-semibold">{foodName}</TableCell>
                    <TableCell>{frequency}</TableCell>
                    <TableCell className="text-right">
                      <div className="w-[16px] ml-auto">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-4 w-4 transition-transform ${
                            isCollapsedFood ? '' : 'rotate-180'
                          }`}
                          viewBox="0 0 20 20"
                          fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </TableCell>
                  </TableRow>
                  {notes.map(({ note, name }: TObject, noteIndex: number) => (
                    <TableRow
                      className={isCollapsedFood ? 'hidden' : ''}
                      key={noteIndex}>
                      <TableCell className="text-xs">
                        {foodIndex + 1}.{noteIndex + 1}
                      </TableCell>
                      <TableCell className="text-xs"> {name}</TableCell>
                      <TableCell className="text-xs">{note || '-'}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  ))}
                </Fragment>
              );
            })}
          </>
        )}

        {!isGroupOrder &&
          lineItems?.map((lineItem: TObject, foodIndex: number) => {
            const { name: foodName, quantity: frequency } = lineItem;

            return (
              <TableRow
                className="bg-neutral-200 hover:bg-neutral-200"
                key={foodIndex}>
                <TableCell>{foodIndex + 1}</TableCell>
                <TableCell className="font-semibold">{foodName}</TableCell>
                <TableCell>{frequency}</TableCell>
                <TableCell></TableCell>
              </TableRow>
            );
          })}
      </TableBody>
    </Table>
  );
};

export default TrackingOrderDetailInfo;
