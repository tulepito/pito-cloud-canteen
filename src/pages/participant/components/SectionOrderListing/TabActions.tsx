import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';

import Button from '@components/Button/Button';
import IconBanned from '@components/Icons/IconBanned/IconBanned';
import IconRefreshing from '@components/Icons/IconRefreshing/IconRefreshing';
import { useAppDispatch } from '@hooks/reduxHooks';
import { ParticipantPlanThunks } from '@pages/participant/plans/[planId]/ParticipantPlanPage.slice';
import { shoppingCartThunks } from '@redux/slices/shoppingCart.slice';

import css from './SectionOrderListing.module.scss';

type TTabActionsProps = {
  className?: string;
  planId: string;
  orderDay: string;
  isOrderDeadlineOver: boolean;
  getNextSubOrderDay: (dayId: string) => string;
  onSelectTab: (item: any) => void;
};

const TabActions: React.FC<TTabActionsProps> = ({
  className,
  planId,
  orderDay,
  isOrderDeadlineOver,
  getNextSubOrderDay,
  onSelectTab,
}) => {
  const dispatch = useAppDispatch();

  const handleAutoSelect = () => {
    dispatch(ParticipantPlanThunks.recommendFoodSubOrder(orderDay));
    const nextDate = getNextSubOrderDay(orderDay);
    onSelectTab({ id: nextDate });
  };

  const handleNotJoinDay = () => {
    dispatch(
      shoppingCartThunks.addToCart({
        planId,
        dayId: orderDay,
        mealId: 'notJoined',
      }),
    );
    const nextDate = getNextSubOrderDay(orderDay);
    onSelectTab({ id: nextDate });
  };

  return (
    <div className={classNames(css.tabActions, className)}>
      <Button
        variant="secondary"
        disabled={isOrderDeadlineOver}
        onClick={handleAutoSelect}
        className={css.autoSelect}>
        <IconRefreshing className={css.iconRefresh} />
        <p className="one-line-text">
          &nbsp;&nbsp;
          <FormattedMessage id="SectionOrderListing.selectForMeBtn" />
        </p>
      </Button>
      <Button
        variant="secondary"
        disabled={isOrderDeadlineOver}
        onClick={handleNotJoinDay}
        className={css.notJoinThisDay}>
        <IconBanned className={css.iconNotJoined} />
        <p className="one-line-text">
          &nbsp;&nbsp;
          <FormattedMessage id="SectionOrderListing.notJoinThisDay" />
        </p>
      </Button>
    </div>
  );
};

export default TabActions;
