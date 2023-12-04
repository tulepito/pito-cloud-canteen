import { useIntl } from 'react-intl';
import classNames from 'classnames';

import PitoLogo from '@components/PitoLogo/PitoLogo';
import { EPartnerVATSetting } from '@src/utils/enums';
import { formatTimestamp } from '@utils/dates';
import type { TDefaultProps, TObject } from '@utils/types';

import type { TReviewInfoFormValues } from '../ReviewView/ReviewInfoSection/ReviewInfoForm';

import CartSection from './CartSection';
import InfoSection from './InfoSection';
import OrderDetailSection from './OrderDetailSection';

import css from './PriceQuotation.module.scss';

type TPriceQuotationProps = TDefaultProps & {
  subOrderDate?: number | string;
  isPartnerQuotation?: boolean;
  vatSetting?: EPartnerVATSetting;
  shouldSkipVAT?: boolean;
  data: {
    customerData: Partial<TReviewInfoFormValues> & {
      email: string;
    };
    orderData: {
      orderTitle: string;
      companyName: string;
      startDate: number;
      endDate: number;
      deliveryHour: string;
    };
    cartData: {
      serviceFee: string;
      totalPrice: string;
      PITOFee?: string;
      promotion: string;
      totalWithVAT: string;
      transportFee: string;
      VATFee: string;
      vatPercentage: number;
    };
    orderDetailData: {
      foodOrderGroupedByDate: TObject[];
    };
  };
};

const PriceQuotation: React.FC<TPriceQuotationProps> = ({
  subOrderDate,
  isPartnerQuotation = false,
  data,
  vatSetting = EPartnerVATSetting.vat,
  className,
}) => {
  const {
    customerData,
    cartData,
    orderData: { orderTitle, companyName, startDate, endDate, deliveryHour },
    orderDetailData,
  } = data;
  const intl = useIntl();

  const classes = classNames(css.root, className);

  const formattedStartDate = formatTimestamp(startDate, 'dd/MM/yyyy');
  const formattedEndDate = formatTimestamp(endDate, 'dd/MM/yyyy');

  const infoSectionData = {
    ...customerData,
    companyName,
    startDate: formattedStartDate,
    endDate: formattedEndDate,
    subOrderDate,
    isPartnerQuotation,
    deliveryHour,
  };

  const cartProps = {
    ...cartData,
    isPartnerQuotation,
    vatSetting,
  };

  const subOrderDayIndex = subOrderDate
    ? new Date(Number(subOrderDate)).getDay()
    : null;

  const formattedOrderTitle =
    typeof subOrderDayIndex === 'number'
      ? `${orderTitle}-${subOrderDayIndex}`
      : orderTitle;

  return (
    <div className={classes} id="priceQuotation">
      <div className={css.titleContainer} id="header">
        <div>
          {intl.formatMessage(
            { id: 'OrderDetails.PriceQuotation.title' },
            { orderName: formattedOrderTitle },
          )}
        </div>
        <PitoLogo className={css.PITOlogo} variant="secondary" />
      </div>
      <div className={css.contentContainer}>
        <InfoSection id={'infoSection'} {...infoSectionData} />
        <CartSection id={'summaryPrice'} {...cartProps} />
        <OrderDetailSection
          itemId="quoteItem"
          subOrderDate={subOrderDate}
          {...orderDetailData}
        />
      </div>
    </div>
  );
};

export default PriceQuotation;
