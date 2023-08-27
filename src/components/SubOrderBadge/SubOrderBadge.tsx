import { useIntl } from 'react-intl';

import Badge, { EBadgeType } from '@components/Badge/Badge';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { ETransition } from '@src/utils/transaction';

import css from './SubOrderBadge.module.scss';

type TSubOrderBadgeProps = { lastTransition: string };

const SubOrderBadge: React.FC<TSubOrderBadgeProps> = ({ lastTransition }) => {
  let badgeComponent = null;
  const intl = useIntl();

  if (lastTransition === ETransition.INITIATE_TRANSACTION) {
    badgeComponent = (
      <Badge
        label={intl.formatMessage({ id: 'SubOrderBadge.inProgress' })}
        type={EBadgeType.info}
      />
    );
  } else if (lastTransition === ETransition.COMPLETE_DELIVERY) {
    badgeComponent = (
      <Badge
        label={intl.formatMessage({ id: 'SubOrderBadge.delivered' })}
        className={css.delivered}
      />
    );
  } else if (lastTransition === ETransition.START_DELIVERY) {
    badgeComponent = (
      <Badge
        label={intl.formatMessage({ id: 'SubOrderBadge.delivering' })}
        className={css.delivering}
      />
    );
  } else if (
    lastTransition === ETransition.CANCEL_DELIVERY ||
    lastTransition === ETransition.OPERATOR_CANCEL_PLAN
  ) {
    badgeComponent = (
      <Badge
        label={intl.formatMessage({ id: 'SubOrderBadge.canceled' })}
        className={css.canceled}
      />
    );
  }

  return (
    <RenderWhen condition={Boolean(lastTransition)}>
      <div className={css.root}>{badgeComponent}</div>

      <RenderWhen.False>
        <Badge
          label={intl.formatMessage({ id: 'SubOrderBadge.inProgress' })}
          type={EBadgeType.info}
        />
      </RenderWhen.False>
    </RenderWhen>
  );
};

export default SubOrderBadge;
