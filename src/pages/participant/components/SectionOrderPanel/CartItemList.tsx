import React from 'react';
import { useIntl } from 'react-intl';
import { DateTime } from 'luxon';

import { isOrderOverDeadline } from '@helpers/orderHelper';
import { useAppSelector } from '@hooks/reduxHooks';
import { Listing } from '@utils/data';
import type { TObject } from '@utils/types';

import CartItem from './CartItem';

type TCartItemList = {
  className?: string;
  cartList: TObject;
  cartListKeys: string[];
  plan: any;
  handleRemoveItem: (dayId: string) => void;
};

const CartItemList: React.FC<TCartItemList> = ({
  cartList,
  plan,
  cartListKeys,
  handleRemoveItem,
}) => {
  const intl = useIntl();
  const order = useAppSelector((state) => state.ParticipantPlanPage.order);

  const isOrderDeadlineOver = isOrderOverDeadline(order);

  const onRemoveItem = (dayId: string) => () => {
    handleRemoveItem(dayId);
  };
  // Functions
  const renderItem = (item: any, key: string) => {
    const planDate = DateTime.fromMillis(Number(key)).toJSDate();
    const itemLabel = `${intl.formatMessage({
      id: `Calendar.week.dayHeader.${planDate.getDay()}`,
    })}, ${planDate.getDate()}/${
      planDate.getMonth() + 1
    }/${planDate.getFullYear()}`;

    const { foodId = '' } = item;

    if (foodId === '') {
      return null;
    }

    const foodList = plan?.[key]?.foodList || [];
    const selectedDish =
      foodId === 'notJoined'
        ? null
        : foodList.find((food: any) => food?.id?.uuid === foodId);
    const dishAttributes =
      foodId === 'notJoined' ? null : Listing(selectedDish).getAttributes();
    const dishTitle =
      foodId === 'notJoined'
        ? intl.formatMessage({ id: 'SectionOrderPanel.notJoined' })
        : dishAttributes?.title;

    return (
      <CartItem
        key={key}
        label={itemLabel}
        value={dishTitle}
        removeDisabled={isOrderDeadlineOver}
        onRemove={onRemoveItem(key)}
      />
    );
  };

  return (
    <>
      {cartListKeys.map((cartKey: string) =>
        renderItem(cartList[cartKey], cartKey),
      )}
    </>
  );
};

export default CartItemList;
