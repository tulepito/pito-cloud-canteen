import { InlineTextButton } from '@components/Button/Button';
import IconBanned from '@components/Icons/IconBanned/IconBanned';
import { useAppDispatch } from '@hooks/reduxHooks';
import { shopingCartThunks } from '@redux/slices/shopingCart.slice';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';

import css from './SectionOrderListing.module.scss';

type TTabActionsProps = {
  className?: string;
  planId: string;
  orderDay: string;
};

const TabActions: React.FC<TTabActionsProps> = ({
  className,
  planId,
  orderDay,
}) => {
  const dispatch = useAppDispatch();

  const handleNotJoinDay = () => {
    dispatch(
      shopingCartThunks.addToCart({
        planId,
        dayId: orderDay,
        mealId: 'notJoined',
      }),
    );
  };

  return (
    <div className={classNames(css.tabActions, className)}>
      <InlineTextButton
        onClick={handleNotJoinDay}
        className={css.notJoinThisDay}>
        <IconBanned className={css.iconNotJoined} />
        <FormattedMessage id="SectionOrderListing.notJoinThisDay" />
      </InlineTextButton>
    </div>
  );
};

export default TabActions;
