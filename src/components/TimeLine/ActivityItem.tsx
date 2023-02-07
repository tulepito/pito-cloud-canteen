import classNames from 'classnames';
import { useIntl } from 'react-intl';

import css from './ActivityItem.module.scss';
import type { TTimeLineItemProps } from './types';

type TActivityItemProps = TTimeLineItemProps;

const ActivityItem: React.FC<TActivityItemProps> = ({
  data,
  rootClassName,
  className,
}) => {
  const intl = useIntl();
  const {
    label = intl.formatMessage({ id: 'ActivityItem.defaultLabel' }),
    description,
  } = data;

  const rootClasses = classNames(rootClassName || css.root, className);

  return (
    <div className={rootClasses}>
      <div className={css.label}>{label}</div>
      {description && <div className={css.description}>{description}</div>}
    </div>
  );
};

export default ActivityItem;
