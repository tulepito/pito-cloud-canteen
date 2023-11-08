import { useIntl } from 'react-intl';

import Badge, { EBadgeType } from '@components/Badge/Badge';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { ETransition } from '@src/utils/transaction';

import css from './SubOrderBadge.module.scss';

type TSubOrderBadgeProps = { lastTransition: ETransition };

const SubOrderBadge: React.FC<TSubOrderBadgeProps> = ({ lastTransition }) => {
  let badgeComponent = null;
  const intl = useIntl();

  switch (lastTransition) {
    case ETransition.INITIATE_TRANSACTION:
      badgeComponent = (
        <Badge
          label={intl.formatMessage({ id: 'SubOrderBadge.inProgress' })}
          type={EBadgeType.info}
        />
      );
      break;
    case ETransition.START_DELIVERY:
      badgeComponent = (
        <Badge
          label={intl.formatMessage({ id: 'SubOrderBadge.delivering' })}
          className={css.delivering}
        />
      );
      break;
    case ETransition.PARTNER_CONFIRM_SUB_ORDER:
      badgeComponent = (
        <Badge
          label={intl.formatMessage({ id: 'SubOrderBadge.partnerConfirmed' })}
          type={EBadgeType.strongWarning}
        />
      );
      break;
    case ETransition.PARTNER_REJECT_SUB_ORDER:
      badgeComponent = (
        <Badge
          label={intl.formatMessage({ id: 'SubOrderBadge.partnerRejected' })}
          type={EBadgeType.strongDefault}
        />
      );
      break;
    case ETransition.COMPLETE_DELIVERY:
      badgeComponent = (
        <Badge
          label={intl.formatMessage({ id: 'SubOrderBadge.delivered' })}
          className={css.delivered}
        />
      );
      break;

    case ETransition.CANCEL_DELIVERY:
    case ETransition.OPERATOR_CANCEL_PLAN:
    case ETransition.OPERATOR_CANCEL_AFTER_PARTNER_CONFIRMED:
    case ETransition.OPERATOR_CANCEL_AFTER_PARTNER_REJECTED:
      badgeComponent = (
        <Badge
          label={intl.formatMessage({ id: 'SubOrderBadge.canceled' })}
          className={css.canceled}
        />
      );
      break;
    default:
      break;
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
