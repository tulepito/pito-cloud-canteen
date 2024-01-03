import type { PropsWithChildren } from 'react';
import React from 'react';
import classNames from 'classnames';

import css from './HighlightBox.module.scss';

interface HighlightBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  contentClassName?: string;
}

const HighlightBox = (props: PropsWithChildren<HighlightBoxProps>) => {
  const { className, contentClassName, ...divProps } = props;

  const rootClassNames = classNames(css.root, className);

  const contentClassNames = classNames(css.content, contentClassName);

  return (
    <div className={rootClassNames} {...divProps}>
      <div className={contentClassNames}>{props.children}</div>
    </div>
  );
};

export default HighlightBox;
