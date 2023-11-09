/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo } from 'react';
import classNames from 'classnames';

import IconCancel from '@components/Icons/IconCancel/IconCancel';
import IconDelivering from '@components/Icons/IconDelivering/IconDelivering';
import IconTickWithBackground from '@components/Icons/IconTickWithBackground/IconTickWithBackground';
import IconWarning from '@components/Icons/IconWarning/IconWarning';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import Tooltip from '@components/Tooltip/Tooltip';
import { ETransition } from '@utils/transaction';

import StateItemTooltip from './StateItemTooltip';
import type { TTimeLineItemProps } from './types';

import css from './StateItem.module.scss';

type TStateItemProps = TTimeLineItemProps;

const StateItem: React.FC<TStateItemProps> = ({
  data: { date, orderData, transactionData },
  rootClassName,
  className,
  isAdminLayout = false,
}) => {
  const rootClasses = classNames(rootClassName || css.root, className);
  const {
    lastTransition,
    transactionId,
    editTagVersion,
    oldValues = [],
  } = orderData || {};

  let stateComponent = <div className={classNames(css.icon, css.iconEmpty)} />;

  switch (lastTransition) {
    case ETransition.INITIATE_TRANSACTION:
      break;
    case ETransition.PARTNER_CONFIRM_SUB_ORDER: {
      if (isAdminLayout) {
        stateComponent = (
          <IconTickWithBackground
            className={classNames(css.icon, css.confirmIcon)}
          />
        );
      }
      break;
    }
    case ETransition.PARTNER_REJECT_SUB_ORDER: {
      if (isAdminLayout) {
        stateComponent = (
          <IconWarning className={classNames(css.icon, css.rejectIcon)} />
        );
      }

      break;
    }
    case ETransition.START_DELIVERY:
      stateComponent = <IconDelivering className={css.icon} />;
      break;
    case ETransition.COMPLETE_DELIVERY:
      stateComponent = <IconTickWithBackground className={css.icon} />;
      break;
    case ETransition.EXPIRED_START_DELIVERY:
      stateComponent = <IconTickWithBackground className={css.icon} />;
      break;
    case ETransition.CANCEL_DELIVERY:
      stateComponent = <IconCancel className={css.icon} />;
      break;
    case ETransition.OPERATOR_CANCEL_PLAN:
    case ETransition.OPERATOR_CANCEL_AFTER_PARTNER_CONFIRMED:
    case ETransition.OPERATOR_CANCEL_AFTER_PARTNER_REJECTED:
      stateComponent = <IconCancel className={css.icon} />;
      break;

    default:
      break;
  }

  const tooltipContent = useMemo(() => {
    return (
      <StateItemTooltip
        lastTransition={lastTransition}
        transactionId={transactionId}
        transaction={transactionData}
      />
    );
  }, [lastTransition, transactionId, JSON.stringify(transactionData)]);

  const stateItemComponent = useMemo(
    () => (
      <div className={rootClasses}>
        <div className={css.stateContainer}>{stateComponent}</div>
        <div className={css.date}>{`${date}${
          editTagVersion ? `-${editTagVersion}` : ''
        }`}</div>
      </div>
    ),
    [date, rootClasses, stateComponent],
  );

  const oldStateItemComponent = useMemo(
    () =>
      oldValues.map((_oldValues: any, index: number) => (
        <div key={index} className={rootClasses}>
          <div className={css.stateContainer}>
            <IconCancel className={css.icon} />
          </div>
          <div className={css.date}>{`${date}${
            _oldValues?.editTagVersion ? `-${_oldValues.editTagVersion}` : ''
          }`}</div>
        </div>
      )),
    [date, rootClasses],
  );

  return (
    <>
      <RenderWhen condition={isAdminLayout}>{oldStateItemComponent}</RenderWhen>
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
    </>
  );
};

export default StateItem;
