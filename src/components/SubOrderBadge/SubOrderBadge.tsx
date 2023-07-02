import { useIntl } from 'react-intl';
import isEmpty from 'lodash/isEmpty';

import Badge from '@components/Badge/Badge';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import {
  txIsCanceled,
  txIsCompleted,
  txIsDelivering,
  txIsDeliveryFailed,
  txIsInitiated,
} from '@src/utils/transaction';
import type { TTransaction } from '@src/utils/types';

import css from './SubOrderBadge.module.scss';

type TSubOrderBadgeProps = { transaction: TTransaction };

const SubOrderBadge: React.FC<TSubOrderBadgeProps> = ({ transaction }) => {
  let badgeComponent = null;
  const intl = useIntl();

  if (txIsInitiated(transaction)) {
    badgeComponent = (
      <Badge label={intl.formatMessage({ id: 'SubOrderBadge.inProgress' })} />
    );
  } else if (txIsCompleted(transaction)) {
    badgeComponent = (
      <Badge
        label={intl.formatMessage({ id: 'SubOrderBadge.delivered' })}
        className={css.delivered}
      />
    );
  } else if (txIsDelivering(transaction)) {
    badgeComponent = (
      <Badge
        label={intl.formatMessage({ id: 'SubOrderBadge.delivering' })}
        className={css.delivering}
      />
    );
  } else if (txIsDeliveryFailed(transaction)) {
    badgeComponent = (
      <Badge
        label={intl.formatMessage({ id: 'SubOrderBadge.canceled' })}
        className={css.canceled}
      />
    );
  } else if (txIsCanceled(transaction)) {
    badgeComponent = (
      <Badge
        label={intl.formatMessage({ id: 'SubOrderBadge.canceled' })}
        className={css.canceled}
      />
    );
  }

  return (
    <RenderWhen condition={!isEmpty(transaction)}>
      <div className={css.root}>{badgeComponent}</div>
    </RenderWhen>
  );
};

export default SubOrderBadge;
