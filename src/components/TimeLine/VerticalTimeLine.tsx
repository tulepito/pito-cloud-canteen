import classNames from 'classnames';

import type { TTimeLineProps } from './types';
import css from './VerticalTimeLine.module.scss';

type TVerticalTimeLineProps = TTimeLineProps & {
  lastActiveItem: number;
};

const VerticalTimeLine: React.FC<TVerticalTimeLineProps> = (props) => {
  const {
    rootClassName,
    className,
    items,
    lastActiveItem,
    itemComponent: ItemComponent,
    itemClassName,
  } = props;

  const rootClasses = classNames(rootClassName || css.root, className);
  const itemClasses = (isActive: boolean) =>
    classNames(css.item, { [css.isActive]: isActive }, itemClassName);

  const totalItems = items.length;
  const activeBarHeight =
    lastActiveItem === totalItems
      ? '100%'
      : `calc((100% - 20px) * ${
          (lastActiveItem - 1) / (totalItems - 1)
        } + 16px`;

  const rootStyles = {
    height: activeBarHeight,
  };

  return (
    <div className={rootClasses}>
      <div className={css.activeBar} style={rootStyles} />
      {items.map((item, index) => {
        const itemCpm = (
          <ItemComponent
            key={index}
            data={item}
            className={itemClasses(index + 1 <= lastActiveItem)}
          />
        );

        return itemCpm;
      })}
    </div>
  );
};

export default VerticalTimeLine;
