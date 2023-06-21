/* eslint-disable react-hooks/exhaustive-deps */
import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { isEmpty } from 'lodash';

import { useAppSelector } from '@hooks/reduxHooks';
import { Listing, User } from '@utils/data';
import { EParticipantOrderStatus } from '@utils/enums';
import type { TListing, TObject, TUser } from '@utils/types';

export const usePrepareManageOrdersSectionData = (
  currentViewDate: number | string,
  setCurrentViewDate: Dispatch<SetStateAction<number>>,
) => {
  const [defaultActiveKey, setDefaultActiveKey] = useState(1);
  const {
    participantData,
    orderData,
    orderDetail = {},
  } = useAppSelector((state) => state.OrderManagement);

  const { participants = [] } = Listing(orderData as TListing).getMetadata();

  const dateList = Object.entries(orderDetail)
    .reduce<number[]>((prev, [date, orderOnDate]) => {
      const { restaurant } = orderOnDate as TObject;

      return !isEmpty(restaurant?.foodList) ? prev.concat(Number(date)) : prev;
    }, [])
    .sort((x, y) => x - y);
  const indexOfTimestamp = useMemo(
    () => dateList.indexOf(Number(currentViewDate)),
    [currentViewDate, JSON.stringify(dateList)],
  );

  const { restaurant = {}, memberOrders = {} } =
    orderDetail[currentViewDate?.toString()] || {};
  const { foodList = {} } = restaurant;
  const foodOptions = Object.entries<TObject>(foodList).map(
    ([foodId, foodData]) => {
      return {
        foodId,
        foodName: foodData?.foodName || '',
      };
    },
  );

  // Available member IDs to add order details
  const availableMemberIds = isEmpty(memberOrders)
    ? participants
    : (participants as string[]).reduce<string[]>((result, participantId) => {
        const { status = EParticipantOrderStatus.empty } =
          memberOrders[participantId] || {};

        return [
          EParticipantOrderStatus.empty,
          EParticipantOrderStatus.notJoined,
        ].includes(status)
          ? result.concat(participantId)
          : result;
      }, []);

  const memberOptions = useMemo(
    () =>
      availableMemberIds.map((memberId: string) => {
        const participant = participantData.find(
          (p: TUser) => p.id.uuid === memberId,
        );

        const participantGetter = User(participant!);
        const { email } = participantGetter.getAttributes();
        const { firstName, lastName } = participantGetter.getProfile();

        const memberName = `${`${lastName} ${firstName}`} (${email})`;

        return {
          memberId,
          memberName,
          memberEmail: participant?.attributes?.email,
        };
      }),
    [JSON.stringify(availableMemberIds)],
  );

  useEffect(() => {
    if (indexOfTimestamp > -1 && dateList.length > 0) {
      setDefaultActiveKey(indexOfTimestamp + 1);
      setCurrentViewDate(dateList[indexOfTimestamp]);
    }
  }, [indexOfTimestamp, JSON.stringify(dateList)]);

  return {
    dateList,
    defaultActiveKey,
    memberOptions,
    foodOptions,
    currentOrderDetail: orderDetail[currentViewDate],
  };
};
