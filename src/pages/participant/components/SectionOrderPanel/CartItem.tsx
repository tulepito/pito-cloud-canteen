import classNames from 'classnames';

import IconClose from '@components/Icons/IconClose/IconClose';
import IconRefreshing from '@components/Icons/IconRefreshing/IconRefreshing';

import css from './CartItem.module.scss';

type TCartItemProps = {
  className?: string;
  label: string;
  value: string;
  removeDisabled?: boolean;
  onRemove: () => void;
};

const CartItem: React.FC<TCartItemProps> = ({
  className,
  label,
  value,
  removeDisabled = false,
  onRemove,
}) => {
  return (
    <div className={classNames(css.root, className)}>
      <div className={css.label}>
        <span>{label}</span>
        {!removeDisabled && (
          <IconClose onClick={onRemove} className={css.iconClose} />
        )}
      </div>
      <div className={css.value}>
        <IconRefreshing className={css.icon} />
        <span>{value}</span>
      </div>
    </div>
  );
};

export default CartItem;
