import { FormattedMessage } from 'react-intl';
import Skeleton from 'react-loading-skeleton';
import classNames from 'classnames';

import Button from '@components/Button/Button';
import IconRefreshing from '@components/Icons/IconRefreshing/IconRefreshing';

import CartItemList from './CartItemList';

import css from './SectionOrderPanel.module.scss';

type TOrderPanelBody = {
  className?: string;
  loadDataInProgress?: boolean;
  cartList: any;
  cartListKeys: string[];
  plan: any;
  handleRemoveItem: (dayId: string) => void;
  onAutoSelect: () => void;
};

const OrderPanelBody: React.FC<TOrderPanelBody> = ({
  loadDataInProgress,
  cartList,
  cartListKeys,
  plan,
  handleRemoveItem,
  onAutoSelect,
}) => {
  return (
    <div
      className={classNames(css.sectionBody, {
        [css.sectionBodyEmpty]: cartListKeys.length === 0,
      })}>
      <Button
        variant="inline"
        onClick={onAutoSelect}
        className={css.autoSelect}>
        <IconRefreshing className={css.iconRefresh} />
        <FormattedMessage id="SectionOrderListing.selectForMeWholeWeekBtn" />
      </Button>
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
