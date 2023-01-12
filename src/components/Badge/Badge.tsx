import type { TIconProps } from '@utils/types';
import classNames from 'classnames';
import React from 'react';

import css from './Badge.module.scss';

const IconCloseBadge = (props: TIconProps) => {
  const { className } = props;

  return (
    <svg
      className={className}
      width={6}
      height={6}
      viewBox="0 0 6 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.71315 2.99385L5.85964 5.14035C6.04913 5.33653 6.04642 5.64839 5.85355 5.84125C5.66069 6.03412 5.34883 6.03683 5.15265 5.84734L3.00615 3.70085L0.859655 5.84734C0.734118 5.97732 0.548216 6.02945 0.373402 5.98369C0.198588 5.93793 0.0620655 5.80141 0.0163079 5.6266C-0.0294497 5.45178 0.0226782 5.26588 0.152656 5.14035L2.29915 2.99385L0.152656 0.847354C-0.0368295 0.651165 -0.0341196 0.339313 0.158747 0.146446C0.351613 -0.0464201 0.663466 -0.04913 0.859655 0.140356L3.00615 2.28685L5.15265 0.140356C5.34883 -0.04913 5.66069 -0.0464201 5.85355 0.146446C6.04642 0.339313 6.04913 0.651165 5.85964 0.847354L3.71315 2.99385Z"
        fill="#BFBFBF"
      />
    </svg>
  );
};

export const BadgeType = {
  DEFAULT: 'default',
  PROCESSING: 'processing',
  ERROR: 'error',
  SUCCESS: 'success',
  WARNING: 'warning',
};

type TBadge = {
  type?: 'default' | 'processing' | 'error' | 'success' | 'warning';
  hasCloseIcon?: boolean;
  hasDotIcon?: boolean;
  onCloseIcon?: () => void;
  label: string;
  containerClassName?: string;
  labelClassName?: string;
};

const Badge = (props: TBadge) => {
  const {
    type = BadgeType.DEFAULT,
    hasCloseIcon,
    hasDotIcon,
    onCloseIcon,
    label,
    containerClassName,
    labelClassName,
  } = props;

  const badgeContainerClassName = classNames(css.root, containerClassName, {
    ...(type === BadgeType.DEFAULT ? { [css.default]: true } : {}),
    ...(type === BadgeType.PROCESSING ? { [css.processing]: true } : {}),
    ...(type === BadgeType.ERROR ? { [css.error]: true } : {}),
    ...(type === BadgeType.SUCCESS ? { [css.success]: true } : {}),
    ...(type === BadgeType.WARNING ? { [css.warning]: true } : {}),
  });

  const labelClasses = classNames(css.label, labelClassName, {
    ...(type === BadgeType.DEFAULT ? { [css.default]: true } : {}),
    ...(type === BadgeType.PROCESSING ? { [css.processing]: true } : {}),
    ...(type === BadgeType.ERROR ? { [css.error]: true } : {}),
    ...(type === BadgeType.SUCCESS ? { [css.success]: true } : {}),
    ...(type === BadgeType.WARNING ? { [css.warning]: true } : {}),
  });

  const badgeCloseClasses = classNames({
    ...(type === BadgeType.DEFAULT ? { [css.default]: true } : {}),
    ...(type === BadgeType.PROCESSING ? { [css.processing]: true } : {}),
    ...(type === BadgeType.ERROR ? { [css.error]: true } : {}),
    ...(type === BadgeType.SUCCESS ? { [css.success]: true } : {}),
    ...(type === BadgeType.WARNING ? { [css.warning]: true } : {}),
  });

  const badgeDotClasses = classNames(css.badgeDot, {
    ...(type === BadgeType.DEFAULT ? { [css.default]: true } : {}),
    ...(type === BadgeType.PROCESSING ? { [css.processing]: true } : {}),
    ...(type === BadgeType.ERROR ? { [css.error]: true } : {}),
    ...(type === BadgeType.SUCCESS ? { [css.success]: true } : {}),
    ...(type === BadgeType.WARNING ? { [css.warning]: true } : {}),
  });
  return (
    <div className={badgeContainerClassName}>
      <div className={css.badgeContent}>
        {hasDotIcon && <span className={badgeDotClasses}></span>}
        <div className={labelClasses}>{label}</div>
      </div>
      {hasCloseIcon && (
        <div className={css.badgeClose} onClick={onCloseIcon}>
          <IconCloseBadge className={badgeCloseClasses} />
        </div>
      )}
    </div>
  );
};

export default Badge;
