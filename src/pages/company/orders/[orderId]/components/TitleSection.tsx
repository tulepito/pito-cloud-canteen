import IconArrow from '@components/Icons/IconArrow/IconArrow';
import NamedLink from '@components/NamedLink/NamedLink';
import { companyPaths } from '@src/paths';
import type { TDefaultProps } from '@utils/types';
import classNames from 'classnames';
import { useIntl } from 'react-intl';

import css from './TitleSection.module.scss';

type TTitleSectionProps = TDefaultProps & { orderTitle: string };

const TitleSection: React.FC<TTitleSectionProps> = ({
  rootClassName,
  className,
  orderTitle,
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
    { contactNumber, chatLink },
  );

  return (
    <div className={rootClasses}>
      <div className={css.breadCrumb}>
        <div>{orderText}</div>
        <IconArrow direction="right" className={css.arrowIcon} />
        <div className={css.orderName}>{orderName}</div>
      </div>
      <div className={css.subtitle}>{subtitle}</div>
    </div>
  );
};

export default TitleSection;
