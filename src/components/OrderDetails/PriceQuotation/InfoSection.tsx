import { useIntl } from 'react-intl';

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
  } = props;
  const intl = useIntl();

  return (
    <div className={css.infoContainer} id={id}>
      <div className={css.customerSection}>
        <div className={css.sectionTitle}>
          {intl.formatMessage({
            id: 'BookerOrderDetailsPriceQuotation.customerSection.label',
          })}
        </div>
        <div className={css.sectionContent}>
          <div>
            <span>
              {intl.formatMessage({
                id: 'BookerOrderDetailsPriceQuotation.customerSection.fullName',
              })}
            </span>
            <span> {contactPeopleName}</span>
          </div>
          <div>
            <span>
              {intl.formatMessage({
                id: 'BookerOrderDetailsPriceQuotation.customerSection.phoneNumber',
              })}
            </span>
            <span>{contactPhoneNumber}</span>
          </div>
          <div>
            <span>
              {intl.formatMessage({
                id: 'BookerOrderDetailsPriceQuotation.customerSection.email',
              })}
            </span>
            <span>{email}</span>
          </div>
        </div>
      </div>
      <div className={css.orderSection}>
        <div className={css.sectionTitle}>
          {intl.formatMessage({
            id: 'BookerOrderDetailsPriceQuotation.orderSection.label',
          })}
        </div>
        <div className={css.sectionContent}>
          <div>
            <span>
              {intl.formatMessage({
                id: 'BookerOrderDetailsPriceQuotation.orderSection.companyName',
              })}
            </span>
            <span>{companyName}</span>
          </div>

          <div>
            <span>
              {intl.formatMessage({
                id: 'BookerOrderDetailsPriceQuotation.orderSection.duration.label',
              })}
            </span>
            <span>
              {intl.formatMessage(
                {
                  id: 'BookerOrderDetailsPriceQuotation.orderSection.duration.text',
                },
                { start: startDate, end: endDate },
              )}
            </span>
          </div>

          <div>
            <span>
              {intl.formatMessage({
                id: 'BookerOrderDetailsPriceQuotation.orderSection.deliveryAddress',
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
