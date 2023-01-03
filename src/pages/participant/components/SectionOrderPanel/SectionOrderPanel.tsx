import Button, { InlineTextButton } from '@components/Button/Button';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { shopingCartThunks } from '@redux/slices/shopingCart.slice';
import { LISTING } from '@utils/data';
import { DateTime } from 'luxon';
import React from 'react';
import { useIntl } from 'react-intl';
import CartItem from './CartItem';

import css from './SectionOrderPanel.module.scss';

type TSectionOrderPanelProps = {
  planId: string;
};

const SectionOrderPanel: React.FC<TSectionOrderPanelProps> = ({ planId }) => {
  const intl = useIntl();
  const cartList = useAppSelector((state: any) => {
    const currentUser = state.user.currentUser;
    const currUserId = currentUser?.id?.uuid;
    return state.shopingCart.orders?.[currUserId]?.[planId || 1];
  });
  const plan = useAppSelector((state) => state.ParticipantSetupPlanPage.plan);
  const dispatch = useAppDispatch();
  const handleRemoveItem = (dayId: string) => () => {
    dispatch(shopingCartThunks.removeFromCart({ planId, dayId }));
  };

  const handleRemoveAllItem = () => {
    dispatch(shopingCartThunks.removeAllFromPlanCart({ planId }));
  };

  // Functions
  const cartListKeysRaw = Object.keys(cartList || []);
  const cartListKeys = cartListKeysRaw.filter((cartKey) => !!cartList[cartKey]);
  const renderItem = (item: any, key: string) => {
    const planDate = DateTime.fromMillis(Number(key)).toJSDate();
    const itemLabel = `${intl.formatMessage({
      id: `Calendar.week.dayHeader.${planDate.getDay()}`,
    })}, ${planDate.getDate()}/${
      planDate.getMonth() + 1
    }/${planDate.getFullYear()}`;

    const foodList = plan?.[key]?.foodList || [];
    const selectedDish = foodList.find((food: any) => food?.id?.uuid === item);
    const dishAttributes = LISTING(selectedDish).getAttributes();
    const dishTitle = dishAttributes?.title;

    return (
      <CartItem
        key={key}
        label={itemLabel}
        value={dishTitle}
        onRemove={handleRemoveItem(key)}
      />
    );
  };

  // Renders
  const sectionTitle = intl.formatMessage({
    id: 'SectionOrderPanel.sectionTitle',
  });

  const completeOrderButtonLabel = intl.formatMessage({
    id: 'SectionOrderPanel.completeOrder',
  });
  const removeAllOrderCartLabel = intl.formatMessage({
    id: 'SectionOrderPanel.removeAllOrderCartLabel',
  });

  return (
    <div className={css.root}>
      <div className={css.sectionHeader}>
        <p className={css.title}>{sectionTitle}</p>
        <p className={css.selectedDay}>(2/5 ngày đã chọn)</p>
      </div>
      <div className={css.sectionBody}>
        {cartListKeys.map((cartKey: string) =>
          renderItem(cartList[cartKey], cartKey),
        )}
      </div>
      <div className={css.sectionFooter}>
        <Button fullWidth>{completeOrderButtonLabel}</Button>
        <InlineTextButton
          className={css.removeCartLabel}
          onClick={handleRemoveAllItem}>
          {removeAllOrderCartLabel}
        </InlineTextButton>
      </div>
    </div>
  );
};

export default SectionOrderPanel;
