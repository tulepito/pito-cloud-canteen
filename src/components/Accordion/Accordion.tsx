import IconArrowHead from '@components/IconArrowHead/IconArrowHead';
import useBoolean from '@hooks/useBoolean';
import type { PropsWithChildren } from 'react';
import React, { useRef } from 'react';

import css from './Accordion.module.scss';

type TAccordion = {
  title: string;
  isOpen?: boolean;
};

const Accordion = (props: PropsWithChildren<TAccordion>) => {
  const { title = 'Accordion label', children, isOpen = true } = props;
  const { value: isActive, toggle } = useBoolean(isOpen);
  const accordionContentRef = useRef<HTMLDivElement | null>(null);
  const innerStyle = {
    height: `${isActive ? accordionContentRef.current?.scrollHeight : 0}px`,
  };
  return (
    <div className={css.root}>
      <div
        className={css.accordionHeader}
        onClick={() => {
          toggle();
        }}>
        <span className={css.title}>{title}</span>
        <IconArrowHead
          className={isActive ? css.iconArrowUp : css.iconArrowDown}
        />
      </div>
      <div
        className={css.accordionContent}
        ref={accordionContentRef}
        style={innerStyle}>
        {children}
      </div>
    </div>
  );
};

export default Accordion;
