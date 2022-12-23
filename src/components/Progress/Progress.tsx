import type { ReactNode } from 'react';
import React from 'react';

import css from './Progress.module.scss';

type TProgress = {
  type?: 'bar' | 'circle';
  percent: number;
  showInfo?: boolean;
  format?: string | ReactNode;
  animate?: boolean;
  animationDuration?: string;
  showInfoSymbol?: boolean;
  progressColor?: string;
  bgColor?: string;
  size?: number;
  lineWidth?: string;
  onAnimationEnd?: () => void;
};

const ProgressBar = (props: TProgress) => {
  const { percent, showInfo = true, format } = props;

  // eslint-disable-next-line no-nested-ternary
  const info = showInfo ? (
    format ? (
      <span className={css.info}>{format}</span>
    ) : (
      <span className={css.info}>{percent}%</span>
    )
  ) : null;
  const roundedWidth = Math.round(percent) === 100 ? 100 : Math.round(percent);
  return (
    <div className={css.progressBarContainer}>
      <div className={css.progressBar}>
        <span
          className={css.progressActive}
          style={{
            width: `${roundedWidth}%`,
          }}></span>
      </div>
      {info}
    </div>
  );
};

const diameter = (radius: number) => Math.round(Math.PI * radius * 2);
const getOffset = (val: number, radius: number) => {
  return Math.round(((100 - Math.min(val, 100)) / 100) * diameter(radius));
};

const ProgressCircle = (props: TProgress) => {
  const {
    percent = 0,
    animate = true,
    animationDuration = '1s',
    showInfo = true,
    showInfoSymbol = true,
    progressColor = '#EF3D2A',
    bgColor = '#FFECEA',
    size = 80,
    lineWidth = '32',
    onAnimationEnd,
  } = props;

  const strokeDashoffset = getOffset(percent, 175);
  const transition = animate
    ? `stroke-dashoffset ${animationDuration} ease-out`
    : undefined;

  const infoSymbol = showInfoSymbol && '%';

  return (
    <div className={css.progressCircle}>
      <svg
        className={css.progressCircleSVG}
        width={size}
        height={size}
        viewBox="-25 -25 400 400">
        <circle
          stroke={bgColor}
          cx="175"
          cy="175"
          r="175"
          strokeWidth={lineWidth}
          fill="none"
        />
        <circle
          stroke={progressColor}
          transform="rotate(-90 175 175)"
          cx="175"
          cy="175"
          r="175"
          strokeDasharray="1100"
          strokeWidth={lineWidth}
          strokeDashoffset="1100"
          strokeLinecap="round"
          fill="none"
          style={{ strokeDashoffset, transition }}
          onTransitionEnd={onAnimationEnd}
        />
      </svg>
      {showInfo && (
        <span className={css.info}>
          {percent}
          {infoSymbol}
        </span>
      )}
    </div>
  );
};

const Progress = (props: TProgress) => {
  const { type = 'bar', ...rest } = props;

  return type === 'bar' ? (
    <ProgressBar {...rest} />
  ) : (
    <ProgressCircle {...rest} />
  );
};

export default Progress;
