import type { PropsWithChildren } from 'react';
import React from 'react';
import classNames from 'classnames';

import css from './ParticipantLayout.module.scss';

type TParticipantLayout = {
  className?: string;
};

const ParticipantLayout: React.FC<PropsWithChildren<TParticipantLayout>> = (
  props,
) => {
  const { children, className } = props;

  const classes = classNames(css.root, className);

  return <div className={classes}>{children}</div>;
};

export default ParticipantLayout;
