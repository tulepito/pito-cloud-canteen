import type { ReactNode } from 'react';
import classNames from 'classnames';

import IconArrowFull from '@components/Icons/IconArrow/IconArrowFull';
import { EFluctuationType } from '@src/utils/enums';

import css from './TotalStatisticItem.module.scss';

type TTotalStatisticItemProps = {
  icon: ReactNode;
  title: string;
  value: string | number;
  fluctuation: EFluctuationType;
  className?: string;
};

const TotalStatisticItem: React.FC<TTotalStatisticItemProps> = (props) => {
  const { icon, title, value, fluctuation, className } = props;

  const fluctuationIcon = () => {
    switch (fluctuation) {
      case EFluctuationType.INCREASE:
        return <IconArrowFull className={css.upIcon} />;
      case EFluctuationType.DECREASE:
        return <IconArrowFull className={css.downIcon} />;
      default:
        break;
    }
  };

  const classes = classNames(css.root, className);

  return (
    <div className={classes}>
      <div className={css.iconTitleWrapper}>
        <div className={css.iconWrapper}>{icon}</div>
        <div className={css.title}>{title}</div>
      </div>
      <div className={css.valueWrapper}>
        <div className={css.value}>{value}</div>
        {fluctuationIcon()}
      </div>
    </div>
  );
};

export default TotalStatisticItem;
