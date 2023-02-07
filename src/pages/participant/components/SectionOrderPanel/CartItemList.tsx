import { isOverDeadline } from '@helpers/orderHelper';
import { useAppSelector } from '@hooks/reduxHooks';
import { LISTING } from '@utils/data';
import { DateTime } from 'luxon';
import React from 'react';
import { useIntl } from 'react-intl';

import CartItem from './CartItem';

type TCartItemList = {
  className?: string;
  cartList: Record<string, any>;
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

  const isOrderDeadlineOver = isOverDeadline(order);

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

    const foodList = plan?.[key]?.foodList || [];
    const selectedDish =
      item === 'notJoined'
        ? null
        : foodList.find((food: any) => food?.id?.uuid === item);
    const dishAttributes =
      item === 'notJoined' ? null : LISTING(selectedDish).getAttributes();
    const dishTitle =
      item === 'notJoined'
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
