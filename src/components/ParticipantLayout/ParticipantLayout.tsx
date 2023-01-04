import type { PropsWithChildren } from 'react';
import React from 'react';

import css from './ParticipantLayout.module.scss';

type TParticipantLayout = {};

const ParticipantLayout: React.FC<PropsWithChildren<TParticipantLayout>> = (
  props,
) => {
  const { children } = props;
  return <div className={css.root}>{children}</div>;
};

export default ParticipantLayout;
