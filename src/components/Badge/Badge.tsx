import React from 'react';
import classNames from 'classnames';

import type { TIconProps } from '@utils/types';

import css from './Badge.module.scss';

const IconCloseBadge: React.FC<TIconProps> = (props) => {
  const { className } = props;

  return (
    <svg
      preserveAspectRatio="none"
      width={6}
      height={6}
      viewBox="0 0 6 6"
      fill="none"
      className={className}
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

export enum EBadgeType {
  default = 'default',
  info = 'info',
  danger = 'danger',
  success = 'success',
  warning = 'warning',
  caution = 'caution',
  darkBlue = 'darkBlue',
  strongSuccess = 'strongSuccess',
  strongDanger = 'strongDanger',
  strongWarning = 'strongWarning',
  strongDefault = 'strongDefault',
}

type TBadgeProps = {
  type?: EBadgeType;
  hasCloseIcon?: boolean;
  hasDotIcon?: boolean;
  onCloseIcon?: () => void;
  label: string;
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
};

const Badge: React.FC<TBadgeProps> = (props) => {
  const {
    type = EBadgeType.default,
    hasCloseIcon = false,
    hasDotIcon = false,
    onCloseIcon,
    label,
    className,
    labelClassName,
  } = props;

  const classesFormType = {
    [css.default]: type === EBadgeType.default,
    [css.info]: type === EBadgeType.info,
    [css.danger]: type === EBadgeType.danger,
    [css.success]: type === EBadgeType.success,
    [css.warning]: type === EBadgeType.warning,
    [css.caution]: type === EBadgeType.caution,
    [css.darkBlue]: type === EBadgeType.darkBlue,
    [css.strongSuccess]: type === EBadgeType.strongSuccess,
    [css.strongDanger]: type === EBadgeType.strongDanger,
    [css.strongWarning]: type === EBadgeType.strongWarning,
    [css.strongDefault]: type === EBadgeType.strongDefault,
  };

  const badgeContainerClassName = classNames(
    css.root,
    classesFormType,
    className,
  );
  const labelClasses = classNames(css.label, classesFormType, labelClassName);
  const badgeCloseClasses = classNames(classesFormType, labelClassName);
  const badgeDotClasses = classNames(
    css.badgeDot,
    classesFormType,
    labelClassName,
  );

  return (
    <div className={badgeContainerClassName}>
      <div className={css.badgeContent}>
        {hasDotIcon && <span className={badgeDotClasses}></span>}
        <div className={labelClasses} title={label}>
          {label}
        </div>
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
