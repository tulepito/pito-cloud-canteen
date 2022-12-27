import Tooltip from 'rc-tooltip';
import type { PropsWithChildren } from 'react';
import React from 'react';

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

type TTooltip = {
  placement?: TPlacement;
  children?: any;
};

const Tooltips: PropsWithChildren<React.FC<TTooltip>> = (props) => {
  const { placement = 'right', children } = props;

  const tooltipProps = {
    placement,
    trigger: ['click'],
    overlay: <span>Hello</span>,
  };

  return <Tooltip {...tooltipProps}>{children}</Tooltip>;
};

export default Tooltips;
