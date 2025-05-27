import React from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import type { PaginationProps as RCPaginationProps } from 'rc-pagination';
import ExternalPagination from 'rc-pagination';
import Select from 'rc-select';

import { getCurrentLocaleFromLocalStorage } from '@src/translations/TranslationProvider';
import type { TDefaultProps, TIconProps } from '@utils/types';

import css from './Pagination.module.scss';

const NextIcon: React.FC<TIconProps> = (props) => {
  const { rootClassName, className } = props;
  const classes = classNames(rootClassName, className);

  return (
    <svg
      preserveAspectRatio="none"
      width={6}
      height={10}
      viewBox="0 0 6 10"
      fill="none"
      className={classes}
      xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.52827 0.527293C0.788619 0.266944 1.21073 0.266944 1.47108 0.527293L5.47108 4.52729C5.73143 4.78764 5.73143 5.20975 5.47108 5.4701L1.47108 9.4701C1.21073 9.73045 0.788619 9.73045 0.52827 9.4701C0.26792 9.20975 0.26792 8.78764 0.52827 8.52729L4.05687 4.9987L0.52827 1.4701C0.26792 1.20975 0.26792 0.787643 0.52827 0.527293Z"
        fill="#8C8C8C"
      />
    </svg>
  );
};

const PreviousIcon: React.FC<TIconProps> = (props) => {
  const { rootClassName, className } = props;
  const classes = classNames(rootClassName, className);

  return (
    <svg
      preserveAspectRatio="none"
      width={6}
      height={10}
      viewBox="0 0 6 10"
      fill="none"
      className={classes}
      xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.47108 0.527293C5.73143 0.787643 5.73143 1.20975 5.47108 1.4701L1.94248 4.9987L5.47108 8.52729C5.73143 8.78764 5.73143 9.20975 5.47108 9.4701C5.21073 9.73045 4.78862 9.73045 4.52827 9.4701L0.52827 5.4701C0.26792 5.20975 0.26792 4.78764 0.52827 4.52729L4.52827 0.527293C4.78862 0.266944 5.21073 0.266944 5.47108 0.527293Z"
        fill="#8C8C8C"
      />
    </svg>
  );
};

const localeVi = {
  items_per_page: '/ trang',
};

type TPaginationProps = TDefaultProps &
  RCPaginationProps & {
    showInfo?: boolean;
    paginationInfoClassName?: string;
  };

const Pagination: React.FC<TPaginationProps> = (props) => {
  const {
    showInfo = true,
    paginationInfoClassName,
    className,
    rootClassName,
    ...restProps
  } = props;
  const intl = useIntl();

  const rootClasses = classNames(rootClassName || css.root, className);

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const customShowTotal = (total: number, range: number[]) => {
    const paginationInfoClasses = classNames(
      css.paginationInfoContainer,
      paginationInfoClassName,
    );
    const info = intl.formatMessage(
      {
        id: 'Pagination.info',
      },
      {
        from: range[0],
        to: range[1],
        total,
      },
    );

    return showInfo ? (
      <div className={paginationInfoClasses}>
        <span className={css.paginationInfo}>{info}</span>
      </div>
    ) : (
      ''
    );
  };

  const nextIcon = (
    <div className={css.nextIconContainer}>
      <NextIcon className={css.nextIcon} />
    </div>
  );

  const prevIcon = (
    <div className={css.prevIconContainer}>
      <PreviousIcon className={css.prevIcon} />
    </div>
  );

  const paginationProps = {
    className: rootClasses,
    ...restProps,
    showTotal: customShowTotal,
    nextIcon,
    prevIcon,
    selectComponentClass: Select,
    locale:
      getCurrentLocaleFromLocalStorage() === 'vi'
        ? localeVi
        : {
            items_per_page: '/ page',
          },
  };

  return <ExternalPagination {...paginationProps} />;
};

export default Pagination;
