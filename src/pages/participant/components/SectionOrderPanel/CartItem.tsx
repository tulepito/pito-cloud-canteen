import classNames from 'classnames';

import IconClose from '@components/Icons/IconClose/IconClose';
import IconRefreshing from '@components/Icons/IconRefreshing/IconRefreshing';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { ParticipantPlanThunks } from '@pages/participant/plans/[planId]/ParticipantPlanPage.slice';
import { SINGLE_PICK_FOOD_NAMES } from '@src/utils/constants';

import css from './CartItem.module.scss';

type TCartItemProps = {
  className?: string;
  label: string;
  value: string;
  removeDisabled?: boolean;
  subOrderDate?: string;
  onRemove: () => void;
  foodPosition?: 'first' | 'second';
};

const CartItem: React.FC<TCartItemProps> = ({
  label,
  value,
  removeDisabled = false,
  subOrderDate,
  onRemove,
  foodPosition,
}) => {
  const dispatch = useAppDispatch();
  const isAllowAddSecondaryFood = useAppSelector(
    (state) => state.ParticipantPlanPage.isAllowAddSecondaryFood,
  );

  const handleAutoSelect = () => {
    dispatch(ParticipantPlanThunks.recommendFoodSubOrder(subOrderDate!));
  };

  const isFoodIsSingleSelection = SINGLE_PICK_FOOD_NAMES.some((name) =>
    value?.toLowerCase()?.includes(name.toLowerCase()),
  );

  const isShowBottomBorder =
    (!removeDisabled && isAllowAddSecondaryFood && foodPosition === 'second') ||
    isFoodIsSingleSelection;

  return (
    <div
      className={classNames(
        'px-[18px]',
        isShowBottomBorder
          ? 'border-b border-neutralGray3 pb-[10px]'
          : 'pt-[10px]',
        isFoodIsSingleSelection ? 'pt-[10px]' : '',
      )}>
      <div className={css.label}>
        <span className="flex items-center gap-2">
          {label && <span>{label}</span>}
        </span>
        {!removeDisabled && (
          <IconClose onClick={onRemove} className={css.iconClose} />
        )}
      </div>
      {isAllowAddSecondaryFood && (
        <div>
          {foodPosition === 'first' && (
            <span className="text-primaryPri2 text-xs font-medium">
              (Món 1)
            </span>
          )}
          {foodPosition === 'second' && (
            <span className="text-sematicGreen2 text-xs font-medium">
              (Món 2)
            </span>
          )}
        </div>
      )}
      <div className={css.value}>
        <IconRefreshing className={css.icon} onClick={handleAutoSelect} />
        <span>{value}</span>
      </div>
    </div>
  );
};

export default CartItem;
