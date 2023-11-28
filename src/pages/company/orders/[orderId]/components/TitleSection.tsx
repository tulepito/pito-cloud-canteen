import { useIntl } from 'react-intl';
import Skeleton from 'react-loading-skeleton';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';

import Button from '@components/Button/Button';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import NamedLink from '@components/NamedLink/NamedLink';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { companyPaths } from '@src/paths';
import type { TDefaultProps } from '@utils/types';

import css from './TitleSection.module.scss';

type TTitleSectionProps = TDefaultProps & {
  orderTitle: string;
  canReview: boolean;
  goToReviewPage: () => void;
};

const TitleSection: React.FC<TTitleSectionProps> = ({
  rootClassName,
  className,
  orderTitle,
  canReview,
  goToReviewPage,
}) => {
  const intl = useIntl();

  const rootClasses = classNames(rootClassName || css.root, className);

  const orderText = (
    <NamedLink path={companyPaths.ManageOrders}>
      {intl.formatMessage({
        id: 'CompanyOrderDetailPage.titleSection.orders',
      })}
    </NamedLink>
  );
  const orderName = intl.formatMessage(
    {
      id: 'CompanyOrderDetailPage.titleSection.orderName',
    },
    { orderName: orderTitle },
  );

  const contactNumber = (
    <b className={css.contactNumber}>
      {intl.formatMessage({
        id: 'CompanyOrderDetailPage.titleSection.contactNumber',
      })}
    </b>
  );
  const chatLink = (
    <span className={css.chatLink}>
      {intl.formatMessage({
        id: 'CompanyOrderDetailPage.titleSection.chatLinkText',
      })}
    </span>
  );
  const subtitle = intl.formatMessage(
    {
      id: 'CompanyOrderDetailPage.titleSection.subtitle',
    },
    { contactNumber },
  );

  const reviewText = intl.formatMessage(
    {
      id: 'CompanyOrderDetailPage.titleSection.reviewButtonText',
    },
    { contactNumber, chatLink },
  );

  const orderNameComponent = (
    <RenderWhen condition={!isEmpty(orderTitle)}>
      <div className={css.orderName}>{orderName}</div>
      <RenderWhen.False>
        <Skeleton containerClassName={css.orderNameSkeleton} />
      </RenderWhen.False>
    </RenderWhen>
  );

  return (
    <div className={rootClasses}>
      <div>
        <div className={css.breadCrumb}>
          <div>{orderText}</div>
          <IconArrow direction="right" className={css.arrowIcon} />
          {orderNameComponent}
        </div>
        <div className={css.mobileOrderTitle}>{orderNameComponent}</div>
        <div className={css.subtitle}>{subtitle}</div>
      </div>
      <RenderWhen condition={canReview}>
        <Button
          variant="secondary"
          className={css.reviewButton}
          onClick={goToReviewPage}>
          {reviewText}
        </Button>
      </RenderWhen>
    </div>
  );
};

export default TitleSection;
