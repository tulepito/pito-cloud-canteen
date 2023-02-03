import classNames from 'classnames';
import RCToolTip from 'rc-tooltip';
import type { PropsWithChildren } from 'react';
import React from 'react';

import css from './Tooltip.module.scss';

type TPlacement =
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight'
  | 'rightTop'
  | 'rightBottom'
  | 'leftTop'
  | 'leftBottom';

type TTooltipProps = PropsWithChildren<{
  overlayClassName?: string;
  placement?: TPlacement;
  tooltipContent?: any;
  trigger?: string;
  showArrow?: boolean;
  overlayInnerStyle?: React.CSSProperties;
}>;

const Tooltip: React.FC<TTooltipProps> = (props) => {
  const {
    placement = 'left',
    overlayClassName,
    tooltipContent,
    trigger = 'hover',
    children,
    showArrow = true,
    overlayInnerStyle,
  } = props;
  const overlayClasses = classNames(css.overlayClassName, overlayClassName);

  const tooltipProps = {
    placement,
    trigger: [trigger],
    overlay: tooltipContent,
    overlayClassName: overlayClasses,
    overlayInnerStyle,
    destroyTooltipOnHide: true,
    showArrow,
  };

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return <RCToolTip {...tooltipProps}>{children}</RCToolTip>;
};

export default Tooltip;
