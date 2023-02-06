import classNames from 'classnames';

import css from './ActivityItem.module.scss';
import type { TTimeLineItemProps } from './types';

type TActivityItemProps = TTimeLineItemProps;

const ActivityItem: React.FC<TActivityItemProps> = ({
  data,
  rootClassName,
  className,
}) => {
  const { label = 'Activity name', description } = data;

  const rootClasses = classNames(rootClassName || css.root, className);

  return (
    <div className={rootClasses}>
      <div className={css.label}>{label}</div>
      {description && <div className={css.description}>{description}</div>}
    </div>
  );
};

export default ActivityItem;
