import { useIntl } from 'react-intl';
import classNames from 'classnames';

import { formatDate } from '@src/utils/dates';

import css from './InfoSection.module.scss';

type TInfoSectionProps = {
  id?: string;
  contactPhoneNumber?: string;
  contactPeopleName?: string;
  companyName: string;
  email: string;
  deliveryAddress?: string;
  startDate: string;
  endDate: string;
  isPartnerQuotation?: boolean;
  subOrderDate?: number | string;
  deliveryHour?: string;
  shouldResponsive?: boolean;
};

const InfoSection: React.FC<TInfoSectionProps> = (props) => {
  const {
    id,
    contactPhoneNumber,
    contactPeopleName,
    companyName,
    email,
    deliveryAddress,
    startDate,
    endDate,
    isPartnerQuotation = false,
    shouldResponsive = false,
    subOrderDate,
    deliveryHour,
  } = props;
  const intl = useIntl();

  return (
    <div
      className={classNames(css.infoContainer, {
        [css.partnerQuotation]: isPartnerQuotation,
        [css.mobileLayout]: shouldResponsive,
      })}
      id={id}>
      {!isPartnerQuotation && (
        <div className={css.customerSection}>
          <div className={css.sectionTitle}>
            {intl.formatMessage({
              id: 'OrderDetails.PriceQuotation.customerSection.label',
            })}
          </div>
          <div className={css.sectionContent}>
            <div>
              <span>
                {intl.formatMessage({
                  id: 'OrderDetails.PriceQuotation.customerSection.fullName',
                })}
              </span>
              <span> {contactPeopleName}</span>
            </div>
            <div>
              <span>
                {intl.formatMessage({
                  id: 'OrderDetails.PriceQuotation.customerSection.phoneNumber',
                })}
              </span>
              <span>{contactPhoneNumber}</span>
            </div>
            <div>
              <span>
                {intl.formatMessage({
                  id: 'OrderDetails.PriceQuotation.customerSection.email',
                })}
              </span>
              <span>{email}</span>
            </div>
          </div>
        </div>
      )}
      <div className={css.orderSection}>
        <div className={css.sectionTitle}>
          {intl.formatMessage({
            id: 'OrderDetails.PriceQuotation.orderSection.label',
          })}
        </div>
        <div className={css.sectionContent}>
          <div>
            <span>
              {intl.formatMessage({
                id: 'OrderDetails.PriceQuotation.orderSection.companyName',
              })}
            </span>
            <span>{companyName}</span>
          </div>

          <div>
            {isPartnerQuotation ? (
              <>
                <span>
                  {intl.formatMessage({
                    id: 'OrderDetails.PriceQuotation.orderSection.fullName',
                  })}
                </span>
                <span> {contactPeopleName}</span>
              </>
            ) : null}
          </div>

          <div>
            <span>
              {intl.formatMessage({
                id: 'OrderDetails.PriceQuotation.orderSection.duration.label',
              })}
            </span>
            {isPartnerQuotation ? (
              <span>
                {intl.formatMessage(
                  {
                    id: 'OrderDetails.PriceQuotation.orderSection.partnerDuration.text',
                  },
                  {
                    subOrderDate: formatDate(
                      new Date(Number(subOrderDate)),
                      'EEE, dd/MM/yyyy',
                    ),
                    deliveryHour,
                  },
                )}
              </span>
            ) : (
              <span>
                {intl.formatMessage(
                  {
                    id: 'OrderDetails.PriceQuotation.orderSection.duration.text',
                  },
                  { start: startDate, end: endDate },
                )}
              </span>
            )}
          </div>

          <div>
            <span>
              {intl.formatMessage({
                id: 'OrderDetails.PriceQuotation.orderSection.deliveryAddress',
              })}
            </span>
            <span>{deliveryAddress}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoSection;
