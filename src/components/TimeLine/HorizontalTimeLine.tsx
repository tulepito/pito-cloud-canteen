import type { ReactNode } from 'react';
import { useRef } from 'react';
import classNames from 'classnames';

import Button from '@components/Button/Button';
import IconArrow from '@components/Icons/IconArrow/IconArrow';

import type { TTimeLineProps } from './types';

import css from './HorizontalTimeLine.module.scss';

type THorizontalTimeLineProps = TTimeLineProps & {
  haveNavigators?: boolean;
  isAdminLayout?: boolean;
  shouldCenterItems?: boolean;
};

const HorizontalTimeLine: React.FC<THorizontalTimeLineProps> = (props) => {
  const {
    rootClassName,
    className,
    items,
    itemComponent: ItemComponent,
    isAdminLayout = false,
    haveNavigators = false,
    shouldCenterItems = false,
  } = props;
  const containerRef = useRef(null);

  const rootClasses = classNames(rootClassName || css.root, className);
  const itemContainerClasses = classNames(css.itemsContainer, {
    [css.centerItems]: shouldCenterItems,
  });
  const totalItems = items.length;

  const itemsToRender = items.reduce<ReactNode[]>(
    (previousList, itemData, currentIndex) => {
      const isLastItem = currentIndex === totalItems - 1;

      const nextItem = (
        <ItemComponent
          key={currentIndex}
          data={itemData}
          isAdminLayout={isAdminLayout}
        />
      );

      return !isLastItem
        ? previousList.concat([
            nextItem,
            <div
              key={`${currentIndex}separator`}
              className={css.connectionLine}
            />,
          ])
        : previousList.concat([nextItem]);
    },
    [],
  );

  const handleHorizontalScrollToEnd = () => {
    requestAnimationFrame(() => {
      const current = containerRef.current as any;
      const itemWidth = parseInt(
        getComputedStyle(containerRef?.current!).width,
        10,
      );
      current.scrollLeft += itemWidth;
    });
  };

  const handleHorizontalScrollToStart = () => {
    requestAnimationFrame(() => {
      const current = containerRef.current as any;
      const itemWidth = parseInt(
        getComputedStyle(containerRef?.current!).width,
        10,
      );
      current.scrollLeft -= itemWidth;
    });
  };

  return (
    <div className={rootClasses}>
      {haveNavigators && (
        <Button
          variant="inline"
          className={css.navigatorBtn}
          onClick={handleHorizontalScrollToStart}>
          <IconArrow direction="left" className={css.navigatorIcon} />
        </Button>
      )}
      <div ref={containerRef} className={itemContainerClasses}>
        {itemsToRender}
      </div>
      {haveNavigators && (
        <Button
          variant="inline"
          className={css.navigatorBtn}
          onClick={handleHorizontalScrollToEnd}>
          <IconArrow direction="right" className={css.navigatorIcon} />
        </Button>
      )}
    </div>
  );
};

export default HorizontalTimeLine;
