import Button from '@components/Button/Button';
import IconBanned from '@components/Icons/IconBanned/IconBanned';
import IconRefreshing from '@components/Icons/IconRefreshing/IconRefreshing';
import { useAppDispatch } from '@hooks/reduxHooks';
import { shoppingCartThunks } from '@redux/slices/shoppingCart.slice';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';

import css from './SectionOrderListing.module.scss';

type TTabActionsProps = {
  className?: string;
  planId: string;
  orderDay: string;
  isOrderDeadlineOver: boolean;
};

const TabActions: React.FC<TTabActionsProps> = ({
  className,
  planId,
  orderDay,
  isOrderDeadlineOver,
}) => {
  const dispatch = useAppDispatch();

  const handleAutoSelect = () => {};
  const handleNotJoinDay = () => {
    dispatch(
      shoppingCartThunks.addToCart({
        planId,
        dayId: orderDay,
        mealId: 'notJoined',
      }),
    );
  };

  return (
    <div className={classNames(css.tabActions, className)}>
      <Button
        variant="secondary"
        disabled={isOrderDeadlineOver}
        onClick={handleAutoSelect}
        className={css.autoSelect}>
        <IconRefreshing className={css.iconRefresh} />
        <FormattedMessage id="SectionOrderListing.selectForMeBtn" />
      </Button>
      <Button
        variant="inline"
        disabled={isOrderDeadlineOver}
        onClick={handleNotJoinDay}
        className={css.notJoinThisDay}>
        <IconBanned className={css.iconNotJoined} />
        <FormattedMessage id="SectionOrderListing.notJoinThisDay" />
      </Button>
    </div>
  );
};

export default TabActions;
