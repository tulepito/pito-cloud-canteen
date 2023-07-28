/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo } from 'react';
import classNames from 'classnames';

import IconCancel from '@components/Icons/IconCancel/IconCancel';
import IconDelivering from '@components/Icons/IconDelivering/IconDelivering';
import IconTickWithBackground from '@components/Icons/IconTickWithBackground/IconTickWithBackground';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import Tooltip from '@components/Tooltip/Tooltip';
import {
  txIsCanceled,
  txIsCompleted,
  txIsDelivering,
  txIsDeliveryFailed,
  txIsInitiated,
} from '@utils/transaction';

import StateItemTooltip from './StateItemTooltip';
import type { TTimeLineItemProps } from './types';

import css from './StateItem.module.scss';

type TStateItemProps = TTimeLineItemProps;

const StateItem: React.FC<TStateItemProps> = ({
  data: { date, tx },
  rootClassName,
  className,
  isAdminLayout = false,
}) => {
  const rootClasses = classNames(rootClassName || css.root, className);

  let stateComponent = <div className={classNames(css.icon, css.iconEmpty)} />;

  if (txIsInitiated(tx)) {
    //
  } else if (txIsCompleted(tx)) {
    stateComponent = <IconTickWithBackground className={css.icon} />;
  } else if (txIsDelivering(tx)) {
    stateComponent = <IconDelivering className={css.icon} />;
  } else if (txIsDeliveryFailed(tx)) {
    stateComponent = <IconTickWithBackground className={css.icon} />;
  } else if (txIsCanceled(tx)) {
    stateComponent = <IconCancel className={css.icon} />;
  }

  const tooltipContent = useMemo(() => {
    return <StateItemTooltip tx={tx} />;
  }, [JSON.stringify(tx)]);

  const stateItemComponent = useMemo(
    () => (
      <div className={rootClasses}>
        <div className={css.stateContainer}>{stateComponent}</div>
        <div className={css.date}>{date}</div>
      </div>
    ),
    [date, rootClasses, stateComponent],
  );

  return (
    <RenderWhen condition={isAdminLayout}>
      <Tooltip
        overlayClassName={css.tooltipOverlay}
        tooltipContent={tooltipContent}
        placement="bottom"
        trigger="hover"
        overlayInnerStyle={{ backgroundColor: '#fff' }}>
        {stateItemComponent}
      </Tooltip>
      <RenderWhen.False>{stateItemComponent}</RenderWhen.False>
    </RenderWhen>
  );
};

export default StateItem;
