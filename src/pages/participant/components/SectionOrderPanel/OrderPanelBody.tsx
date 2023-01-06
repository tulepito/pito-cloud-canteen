import classNames from 'classnames';
import Skeleton from 'react-loading-skeleton';

import CartItemList from './CartItemList';
import css from './SectionOrderPanel.module.scss';

type TOrderPanelBody = {
  className?: string;
  loadDataInProgress?: boolean;
  cartList: any;
  cartListKeys: string[];
  plan: any;
  handleRemoveItem: (dayId: string) => void;
};

const OrderPanelBody: React.FC<TOrderPanelBody> = ({
  loadDataInProgress,
  cartList,
  cartListKeys,
  plan,
  handleRemoveItem,
}) => {
  return (
    <div
      className={classNames(css.sectionBody, {
        [css.sectionBodyEmpty]: cartListKeys.length === 0,
      })}>
      {loadDataInProgress ? (
        <Skeleton className={css.lineItemLoading} count={4} />
      ) : (
        <CartItemList
          cartList={cartList}
          cartListKeys={cartListKeys}
          plan={plan}
          handleRemoveItem={handleRemoveItem}
        />
      )}
    </div>
  );
};

export default OrderPanelBody;
