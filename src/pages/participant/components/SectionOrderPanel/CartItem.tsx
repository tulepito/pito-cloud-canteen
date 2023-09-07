import classNames from 'classnames';

import IconClose from '@components/Icons/IconClose/IconClose';
import IconRefreshing from '@components/Icons/IconRefreshing/IconRefreshing';
import { useAppDispatch } from '@hooks/reduxHooks';
import { ParticipantPlanThunks } from '@pages/participant/plans/[planId]/ParticipantPlanPage.slice';

import css from './CartItem.module.scss';

type TCartItemProps = {
  className?: string;
  label: string;
  value: string;
  removeDisabled?: boolean;
  subOrderDate?: string;
  onRemove: () => void;
};

const CartItem: React.FC<TCartItemProps> = ({
  className,
  label,
  value,
  removeDisabled = false,
  subOrderDate,
  onRemove,
}) => {
  const dispatch = useAppDispatch();

  const handleAutoSelect = () => {
    dispatch(ParticipantPlanThunks.recommendFoodSubOrder(subOrderDate!));
  };

  return (
    <div className={classNames(css.root, className)}>
      <div className={css.label}>
        <span>{label}</span>
        {!removeDisabled && (
          <IconClose onClick={onRemove} className={css.iconClose} />
        )}
      </div>
      <div className={css.value}>
        <IconRefreshing className={css.icon} onClick={handleAutoSelect} />
        <span>{value}</span>
      </div>
    </div>
  );
};

export default CartItem;
