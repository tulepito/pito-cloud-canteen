import IconArrowHead from '@components/IconArrowHead/IconArrowHead';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import React from 'react';

import css from './Accordion.module.scss';

type TAccordion = {
  title: string;
  content: string | ReactNode;
  rootClassName?: string;
  className?: string;
  isActive?: boolean;
  onClick?: () => {};
};

const Accordion = (props: TAccordion) => {
  const { title, content, className, rootClassName, isActive, onClick } = props;
  const classes = classNames(rootClassName || css.root, className);
  const contentClasses = classNames(css.content, { [css.show]: isActive });
  const titleClasses = classNames(css.title, {
    [css.showTitle]: isActive,
  });

  return (
    <div className={classes} onClick={onClick}>
      <div className={css.mainSection}>
        <h5 className={titleClasses}>{title}</h5>
        <IconArrowHead
          direction={isActive ? 'up' : 'down'}
          className={css.iconArrow}
        />
      </div>
      <div className={contentClasses} onClick={(e) => e.stopPropagation()}>
        {content}
      </div>
    </div>
  );
};

export default Accordion;
