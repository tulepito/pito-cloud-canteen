/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react';
import { isEmpty } from 'lodash';

import { useAppSelector } from '@hooks/reduxHooks';
import { buildFullName } from '@src/utils/emailTemplate/participantOrderPicking';
import {
  ETransition,
  TRANSITIONS_TO_STATE_CANCELED,
} from '@src/utils/transaction';
import { Listing, User } from '@utils/data';
import { EOrderStates, EParticipantOrderStatus } from '@utils/enums';
import type { TListing, TObject, TUser } from '@utils/types';

export const usePrepareManageOrdersSectionData = (
  currentViewDate: number | string,
  setCurrentViewDate: (date: number) => void,
) => {
  const [defaultActiveKey, setDefaultActiveKey] = useState(1);
  const {
    participantData,
    orderData,
    draftOrderDetail = {},
  } = useAppSelector((state) => state.OrderManagement);

  const { participants = [], orderStateHistory = [] } = Listing(
    orderData as TListing,
  ).getMetadata();

  const isOrderAlreadyInProgress =
    orderStateHistory.findIndex(
      (_state: { state: string; updatedAt: number }) =>
        _state.state === EOrderStates.inProgress,
    ) !== -1;

  const dateList = Object.entries(draftOrderDetail)
    .reduce<number[]>((prev, [date, orderOnDate]) => {
      const { restaurant, lastTransition } = orderOnDate as TObject;
      const isSubOrderNotAbleToEdit = [
        ETransition.OPERATOR_CANCEL_PLAN,
        ETransition.START_DELIVERY,
        ETransition.COMPLETE_DELIVERY,
      ].includes(lastTransition!);

      return !isEmpty(restaurant?.foodList) &&
        !TRANSITIONS_TO_STATE_CANCELED.includes(lastTransition) &&
        !(isOrderAlreadyInProgress && isSubOrderNotAbleToEdit)
        ? prev.concat(Number(date))
        : prev;
    }, [])
    .sort((x, y) => x - y);
  const indexOfTimestamp = useMemo(
    () => dateList.indexOf(Number(currentViewDate)),
    [currentViewDate, JSON.stringify(dateList)],
  );

  const { restaurant = {}, memberOrders = {} } =
    draftOrderDetail[currentViewDate?.toString()] || {};
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
      availableMemberIds.reduce((accMemberOptions: any[], memberId: string) => {
        const participant = participantData.find(
          (p: TUser) => p.id.uuid === memberId,
        );

        if (!participant) {
          return accMemberOptions;
        }

        const participantGetter = User(participant!);
        const { email } = participantGetter.getAttributes();
        const { firstName, lastName, displayName } =
          participantGetter.getProfile();

        const memberName = `${buildFullName(firstName, lastName, {
          compareToGetLongerWith: displayName,
        })} (${email})`;

        return accMemberOptions.concat({
          memberId,
          memberName,
          memberEmail: participant?.attributes?.email,
        });
      }, []),
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
    currentOrderDetail: draftOrderDetail[currentViewDate] || {},
    hasSubOrders: !isEmpty(draftOrderDetail),
  };
};
