import ButtonIcon from '@components/ButtonIcon/ButtonIcon';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import type { ReactNode } from 'react';
import { useRef } from 'react';

import css from './HorizontalTimeLine.module.scss';
import type { TTimeLineProps } from './types';

type THorizontalTimeLineProps = TTimeLineProps & { haveNavigators?: boolean };

const HorizontalTimeLine: React.FC<THorizontalTimeLineProps> = (props) => {
  const {
    rootClassName,
    className,
    items,
    itemComponent,
    // itemClassName,
    haveNavigators = false,
  } = props;
  const containerRef = useRef(null);

  const currentCtnRef = containerRef.current as any;

  const rootClasses = classNames(rootClassName || css.root, className);
  // const itemClasses = (isActive: boolean) =>
  // classNames(css.item, { [css.isActive]: isActive }, itemClassName);

  const totalItems = items.length;

  const connectionLine = <div className={css.connectionLine} />;

  const itemsToRender = items.reduce<ReactNode[]>(
    (previousList, itemData, currentIndex) => {
      const nextItem = itemComponent({
        data: itemData,
      });

      return currentIndex !== totalItems - 1
        ? previousList.concat([nextItem, connectionLine])
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
