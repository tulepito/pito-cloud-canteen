import { LISTING } from '@utils/data';
import type { TObject } from '@utils/types';
import { DateTime } from 'luxon';
import React from 'react';
import { useIntl } from 'react-intl';

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
