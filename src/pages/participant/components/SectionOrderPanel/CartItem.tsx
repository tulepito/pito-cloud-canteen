import IconClose from '@components/IconClose/IconClose';
import IconRefreshing from '@components/Icons/IconRefreshing';
import classNames from 'classnames';

import css from './CartItem.module.scss';

type TCartItemProps = {
  className?: string;
  label: string;
  value: string;
  onRemove: () => void;
};

const CartItem: React.FC<TCartItemProps> = ({
  className,
  label,
  value,
  onRemove,
}) => {
  return (
    <div className={classNames(css.root, className)}>
      <div className={css.label}>
        <IconRefreshing className={css.icon} />
        <span>{label}</span>
      </div>
      <div className={css.value}>
        <span>{value}</span>
        <IconClose onClick={onRemove} className={css.iconClose} />
      </div>
    </div>
  );
};

export default CartItem;
