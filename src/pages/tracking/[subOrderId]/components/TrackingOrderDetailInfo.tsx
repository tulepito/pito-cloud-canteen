import React, { Fragment, useCallback, useMemo, useState } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table';
import {
  groupPickingOrderByFood,
  groupPickingOrderByFoodLevels,
} from '@helpers/order/orderDetailHelper';
import { useAppSelector } from '@hooks/reduxHooks';
import { Listing } from '@src/utils/data';
import { EOrderType } from '@src/utils/enums';
import type { TListing, TObject } from '@src/utils/types';

type TTrackingOrderDetailInfoProps = {
  subOrderDate: number | string;
};

// Chevron down icon component
const ChevronDownIcon: React.FC<{ isRotated: boolean }> = ({ isRotated }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-4 w-4 transition-transform ${isRotated ? 'rotate-180' : ''}`}
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

const TrackingOrderDetailInfo: React.FC<TTrackingOrderDetailInfoProps> = ({
  subOrderDate,
}) => {
  const order = useAppSelector((state) => state.TrackingPage.order);

  const {
    orderDetailOfDate = {},
    participants = [],
    anonymous = [],
    company = {},
  } = order || {};

  const orderGetter = useMemo(() => Listing(order as TListing), [order]);
  const companyGetter = useMemo(() => Listing(company as TListing), [company]);

  const { orderType = EOrderType.group } = orderGetter.getMetadata() || {};
  const { lineItems = [] } = orderDetailOfDate || {};
  const isGroupOrder = orderType === EOrderType.group;

  const metadata = companyGetter.getAttributes()?.profile?.metadata;
  const groups = useMemo(() => {
    return metadata && Array.isArray(metadata.groups) ? metadata.groups : [];
  }, [metadata]);

  const isHasGroups = groups.length > 0;

  const { groupedData, groupedDataLevels } = useMemo(() => {
    const parsedSubOrderDate = subOrderDate ? Number(subOrderDate) : undefined;
    const orderDetailForDate = { [subOrderDate]: orderDetailOfDate };

    const [groupedDataValue] = groupPickingOrderByFood({
      orderDetail: orderDetailForDate,
      date: parsedSubOrderDate,
      participants,
      anonymous,
    }) || [{}];

    const [groupedDataLevelsValue] = groupPickingOrderByFoodLevels({
      orderDetail: orderDetailForDate,
      date: parsedSubOrderDate,
      participants,
      anonymous,
      groups,
    }) || [{}];

    return {
      groupedData: groupedDataValue,
      groupedDataLevels: groupedDataLevelsValue,
    };
  }, [subOrderDate, orderDetailOfDate, participants, anonymous, groups]);

  const { foodDataList = [] } = groupedData || {};
  const { foodDataList: foodDataListNullLevel = [], dataOfGroups = [] } =
    groupedDataLevels || {};

  const initialCollapseStatesLength = useMemo(() => {
    if (!isGroupOrder) return 0;

    if (isHasGroups) {
      const groupFoodCount = dataOfGroups.reduce(
        (total: number, group: TObject) => {
          return total + (group.foodDataList?.length || 0);
        },
        0,
      );

      return groupFoodCount + (foodDataListNullLevel?.length || 0);
    }

    return foodDataList?.length || 0;
  }, [
    isGroupOrder,
    isHasGroups,
    dataOfGroups,
    foodDataListNullLevel,
    foodDataList,
  ]);

  const [isCollapsed, setIsCollapsed] = useState<boolean[]>(() =>
    new Array(initialCollapseStatesLength).fill(false),
  );

  const totalFood = useMemo(() => {
    const dataToCalculate = isGroupOrder ? foodDataList : lineItems;

    return dataToCalculate.reduce((total: number, item: TObject) => {
      const count = isGroupOrder ? item.frequency || 1 : item.quantity || 1;

      return total + count;
    }, 0);
  }, [isGroupOrder, foodDataList, lineItems]);

  const totalFoodNoGroup = useMemo(() => {
    return foodDataListNullLevel.reduce((total: number, item: TObject) => {
      return total + (item.frequency || 1);
    }, 0);
  }, [foodDataListNullLevel]);

  const handleClickGroupTitle = useCallback(
    (idx: number) => () => {
      setIsCollapsed((prev) => {
        const newState = [...prev];
        newState[idx] = !newState[idx];

        return newState;
      });
    },
    [],
  );

  // Render helpers
  const renderNoteRows = useCallback(
    (notes: TObject[], foodIndex: number, isCollapsedFood: boolean) => {
      if (!Array.isArray(notes) || notes.length === 0) return null;

      return notes.map((noteItem: TObject, noteIndex: number) => {
        const { note, name: noteName } = noteItem || {};

        return (
          <TableRow
            className={isCollapsedFood ? 'hidden' : ''}
            key={`note-${foodIndex}-${noteIndex}`}>
            <TableCell className="text-xs">
              {foodIndex + 1}.{noteIndex + 1}
            </TableCell>
            <TableCell className="text-xs">{noteName || '-'}</TableCell>
            <TableCell className="text-xs">{note || '-'}</TableCell>
            <TableCell></TableCell>
          </TableRow>
        );
      });
    },
    [],
  );

  const renderFoodRow = useCallback(
    (
      foodData: TObject,
      foodIndex: number,
      globalIndex: number,
      showGroupNumber: boolean = false,
    ) => {
      const { foodName, frequency, notes = [] } = foodData || {};
      const isCollapsedFood = isCollapsed[globalIndex] || false;

      return (
        <Fragment key={`food-${foodIndex}-${globalIndex}`}>
          <TableRow
            className="bg-neutral-200 hover:bg-neutral-200 cursor-pointer"
            onClick={handleClickGroupTitle(globalIndex)}>
            <TableCell>
              {showGroupNumber ? `${foodIndex + 1}` : foodIndex + 1}
            </TableCell>
            <TableCell className="font-semibold">
              {foodName || 'Unknown'}
            </TableCell>
            <TableCell>{frequency || 0}</TableCell>
            <TableCell className="text-right">
              <div className="w-[16px] ml-auto">
                <ChevronDownIcon isRotated={!isCollapsedFood} />
              </div>
            </TableCell>
          </TableRow>
          {renderNoteRows(notes, foodIndex, isCollapsedFood)}
        </Fragment>
      );
    },
    [isCollapsed, handleClickGroupTitle, renderNoteRows],
  );

  // Render non-group orders
  if (!isGroupOrder) {
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
          {lineItems.map((lineItem: TObject, foodIndex: number) => {
            const { name: foodName, quantity: frequency } = lineItem || {};

            return (
              <TableRow
                className="bg-neutral-200 hover:bg-neutral-200"
                key={`lineitem-${foodIndex}`}>
                <TableCell>{foodIndex + 1}</TableCell>
                <TableCell className="font-semibold">
                  {foodName || 'Unknown'}
                </TableCell>
                <TableCell>{frequency || 0}</TableCell>
                <TableCell></TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  }

  // Render group orders
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
        {isHasGroups ? (
          <>
            {dataOfGroups.map((group: TObject, groupIndex: number) => {
              const {
                foodDataList: foodDataListGroup = [],
                name: groupName = '',
              } = group || {};

              const totalFoodInGroup = foodDataListGroup.reduce(
                (total: number, item: TObject) => total + (item.frequency || 1),
                0,
              );

              const currentGlobalIndex = dataOfGroups
                .slice(0, groupIndex)
                .reduce(
                  (total: number, g: TObject) =>
                    total + (g.foodDataList?.length || 0),
                  0,
                );

              return (
                <Fragment key={`group-${groupIndex}`}>
                  <TableRow className="bg-neutral-700 hover:bg-neutral-700">
                    <TableCell className="text-white">
                      {groupName || `Group ${groupIndex + 1}`}
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-white">
                      {totalFoodInGroup}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  {foodDataListGroup.map(
                    (foodData: TObject, foodIndex: number) => {
                      const result = renderFoodRow(
                        foodData,
                        foodIndex,
                        currentGlobalIndex + foodIndex,
                      );

                      return result;
                    },
                  )}
                </Fragment>
              );
            })}

            {foodDataListNullLevel.length > 0 && (
              <Fragment>
                <TableRow className="bg-neutral-700 hover:bg-neutral-700">
                  <TableCell className="text-white">Trống</TableCell>
                  <TableCell></TableCell>
                  <TableCell className="text-white">
                    {totalFoodNoGroup}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
                {foodDataListNullLevel.map(
                  (foodData: TObject, foodIndex: number) => {
                    const groupFoodCount = foodDataListNullLevel?.reduce(
                      (total: number, group: TObject) => {
                        return total + (group.foodDataList?.length || 0);
                      },
                      0,
                    );

                    return renderFoodRow(
                      foodData,
                      foodIndex,
                      groupFoodCount + foodIndex,
                    );
                  },
                )}
              </Fragment>
            )}
          </>
        ) : (
          <>
            <TableRow className="bg-neutral-700 hover:bg-neutral-700">
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell className="font-bold text-lg text-white">
                {totalFood}
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
            {foodDataList.map((foodData: TObject, foodIndex: number) =>
              renderFoodRow(foodData, foodIndex, foodIndex),
            )}
          </>
        )}
      </TableBody>
    </Table>
  );
};

export default TrackingOrderDetailInfo;
