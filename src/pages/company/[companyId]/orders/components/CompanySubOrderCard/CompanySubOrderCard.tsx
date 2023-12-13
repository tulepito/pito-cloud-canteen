import React, { Fragment } from 'react';
import { useIntl } from 'react-intl';
import Skeleton from 'react-loading-skeleton';

import Badge, { EBadgeType } from '@components/Badge/Badge';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconClock from '@components/Icons/IconClock/IconClock';
import IconReceipt from '@components/Icons/IconReceipt/IconReceipt';
import NamedLink from '@components/NamedLink/NamedLink';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { parseThousandNumber } from '@helpers/format';
import { useAppSelector } from '@hooks/reduxHooks';
import type { EOrderStates } from '@src/utils/enums';
import { getLabelByKey, ORDER_STATE_OPTIONS } from '@src/utils/options';
import type { TObject } from '@src/utils/types';

import { BADGE_TYPE_BASE_ON_ORDER_STATE } from '../../helpers/constants';
import type { CompanyOrderMobileRenderData } from '../../helpers/getCompanyOrderRenderData';
import { getCompanyOrderRenderData } from '../../helpers/getCompanyOrderRenderData';

import css from './CompanySubOrderCard.module.scss';

type CompanySubOrderCardProps = {
  data: TObject;
};

const CompanySubOrderCard: React.FC<CompanySubOrderCardProps> = (props) => {
  const intl = useIntl();
  const { data } = props;
  const {
    title,
    totalWithVAT,
    state: orderState,
    deliveryHour,
    startDate,
    endDate,
    isCreatedByPitoAdmin,
  } = data;

  const queryCompanyPlansByOrderIdsInProgress = useAppSelector(
    (state) => state.Order.queryCompanyPlansByOrderIdsInProgress,
  );

  const orderText = intl
    .formatMessage({
      id: 'CompanySubOrderCard.order',
    })
    .toUpperCase();

  const companyOrderRenderData = getCompanyOrderRenderData(data, {
    isMobileLayout: true,
  }) as CompanyOrderMobileRenderData;

  const { Component, componentProps } = companyOrderRenderData.namedLinkProps
    ? {
        Component: NamedLink,
        componentProps: companyOrderRenderData.namedLinkProps,
      }
    : companyOrderRenderData.onClick
    ? {
        Component: 'div',
        componentProps: { onClick: companyOrderRenderData.onClick },
      }
    : { Component: Fragment, componentProps: {} };

  return (
    <Component {...componentProps}>
      <div className={css.container}>
        <div className={css.cardHeader}>
          <div className={css.title}>
            {orderText}
            &nbsp;#{title}
            <RenderWhen condition={isCreatedByPitoAdmin}>
              <span className={css.createdByPITO}>
                {intl.formatMessage({
                  id: 'CompanySubOrderCard.createdByPITO',
                })}
              </span>
            </RenderWhen>
          </div>
          <RenderWhen condition={!!Object.keys(componentProps).length}>
            <IconArrow direction="right" />
          </RenderWhen>
        </div>
        <div className={css.cardContent}>
          <div className={css.flexRow}>
            <IconReceipt className={css.iconReceipt} />
            {queryCompanyPlansByOrderIdsInProgress ? (
              <Skeleton width={100} height={20} />
            ) : (
              <span>{`${parseThousandNumber(totalWithVAT)}đ`}</span>
            )}
          </div>
          <Badge
            labelClassName={css.badgeLabel}
            type={
              BADGE_TYPE_BASE_ON_ORDER_STATE[orderState as EOrderStates] ||
              EBadgeType.default
            }
            label={getLabelByKey(ORDER_STATE_OPTIONS, orderState)}
          />
        </div>
        <div className={css.cardFooter}>
          <IconClock className={css.iconClock} />
          <div className={css.hour}>{deliveryHour}</div>
          <div className={css.verticalDevider}>&nbsp;</div>
          <div>
            {startDate} - {endDate}
          </div>
        </div>
      </div>
    </Component>
  );
};

export default CompanySubOrderCard;
