import IconArrowHead from '@components/IconArrowHead/IconArrowHead';
import useBoolean from '@hooks/useBoolean';
import classNames from 'classnames';
import type { PropsWithChildren } from 'react';
import React, { useEffect, useRef, useState } from 'react';

import css from './Accordion.module.scss';

type TAccordionProps = PropsWithChildren<{
  contentClassName?: string;
  headerClassName?: string;
  title: string;
  isOpen?: boolean;
}>;

const Accordion: React.FC<TAccordionProps> = (props) => {
  const {
    title = 'Accordion label',
    children,
    isOpen = true,
    headerClassName,
    contentClassName,
  } = props;
  const [contentHeight, setContentHeight] = useState<number>(0);
  const { value: isActive, toggle } = useBoolean(isOpen);
  const accordionContentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const activeHeight = accordionContentRef.current?.scrollHeight || 0;
    setContentHeight(activeHeight);
  }, [isActive]);

  const innerStyle = {
    height: `${isActive ? contentHeight : 0}px`,
  };
  const headerClasses = classNames(headerClassName || css.accordionHeader);
  const contentClasses = classNames(css.accordionContent, contentClassName);

  return (
    <div className={css.root}>
      <div
        className={headerClasses}
        onClick={() => {
          toggle();
        }}>
        <span className={css.title}>{title}</span>
        <IconArrowHead
          className={isActive ? css.iconArrowUp : css.iconArrowDown}
        />
      </div>
      <div
        className={contentClasses}
        ref={accordionContentRef}
        style={innerStyle}>
        {children}
      </div>
    </div>
  );
};

export default Accordion;
