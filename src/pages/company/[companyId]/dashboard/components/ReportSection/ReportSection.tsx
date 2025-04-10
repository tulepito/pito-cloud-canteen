import React from 'react';
import { FormattedMessage } from 'react-intl';
import Skeleton from 'react-loading-skeleton';
import classNames from 'classnames';

import IconDish from '@components/Icons/IconDish/IconDish';
import IconDollar from '@components/Icons/IconDollar/IconDollar';
import { numberWithDots } from '@src/utils/number';
import type { TCompanyOrderSummary } from '@src/utils/types';

import css from './ReportSection.module.scss';

type TReportSectionProps = {
  companyOrderSummary: TCompanyOrderSummary;
  inProgress: boolean;
};
const ReportSection: React.FC<TReportSectionProps> = (props) => {
  const { companyOrderSummary, inProgress } = props;
  const { totalOrderCost, totalOrderDishes } = companyOrderSummary;

  return (
    <div className={css.root}>
      <h3 className={classNames(css.title, 'font-semibold uppercase')}>
        <FormattedMessage id="ReportSection.title" />
      </h3>
      {inProgress ? (
        <div className={css.reportList}>
          <Skeleton className={css.reportItem} />
          <Skeleton className={css.reportItem} />
        </div>
      ) : (
        <div className={css.reportList}>
          <div className={css.reportItem}>
            <div className={css.content}>
              <p className={css.label}>
                <span className={css.icon}>
                  <IconDish />
                </span>
                <span>
                  <FormattedMessage id="ReportSection.label.totalDishes" />
                </span>
              </p>
              <h5 className={css.count}>{totalOrderDishes}</h5>
            </div>
            <div className={css.icon}>
              <IconDish />
            </div>
          </div>
          <div className={css.reportItem}>
            <div className={css.content}>
              <p className={css.label}>
                <span className={css.icon}>
                  <IconDollar />
                </span>
                <FormattedMessage id="ReportSection.label.totalCost" />
              </p>
              <h5 className={css.count}>{numberWithDots(totalOrderCost)}đ</h5>
            </div>
            <div className={css.icon}>
              <IconDollar />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportSection;
