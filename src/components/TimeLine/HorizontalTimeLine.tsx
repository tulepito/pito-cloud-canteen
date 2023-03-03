import type { ReactNode } from 'react';
import { useRef } from 'react';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';

import ButtonIcon from '@components/ButtonIcon/ButtonIcon';
import IconArrow from '@components/Icons/IconArrow/IconArrow';

import type { TTimeLineProps } from './types';

import css from './HorizontalTimeLine.module.scss';

type THorizontalTimeLineProps = TTimeLineProps & { haveNavigators?: boolean };

const HorizontalTimeLine: React.FC<THorizontalTimeLineProps> = (props) => {
  const {
    rootClassName,
    className,
    items,
    itemComponent: ItemComponent,

    haveNavigators = false,
  } = props;
  const containerRef = useRef(null);

  const currentCtnRef = containerRef.current as any;

  const rootClasses = classNames(rootClassName || css.root, className);
  const totalItems = items.length;

  const itemsToRender = items.reduce<ReactNode[]>(
    (previousList, itemData, currentIndex) => {
      const nextItem = <ItemComponent key={currentIndex} data={itemData} />;

      return currentIndex !== totalItems - 1
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

  const handleNavigator =
    (direction: number = 1) =>
    () => {
      if (isEmpty(currentCtnRef)) {
        return;
      }
      if (direction > 0) {
        currentCtnRef.scrollLeft += currentCtnRef?.clientWidth || 0;
      } else {
        currentCtnRef.scrollLeft -= currentCtnRef?.clientWidth || 0;
      }
    };

  return (
    <div className={rootClasses}>
      {haveNavigators && (
        <ButtonIcon className={css.navigatorBtn} onClick={handleNavigator(-1)}>
          <IconArrow direction="left" />
        </ButtonIcon>
      )}
      <div ref={containerRef} className={css.itemsContainer}>
        {itemsToRender}
      </div>
      {haveNavigators && (
        <ButtonIcon className={css.navigatorBtn} onClick={handleNavigator(+1)}>
          <IconArrow direction="right" />
        </ButtonIcon>
      )}
    </div>
  );
};

export default HorizontalTimeLine;
