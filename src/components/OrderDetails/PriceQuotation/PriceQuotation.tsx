import { useIntl } from 'react-intl';

import PitoLogo from '@components/PitoLogo/PitoLogo';
import { formatTimestamp } from '@utils/dates';
import type { TObject } from '@utils/types';

import type { TReviewInfoFormValues } from '../ReviewView/ReviewInfoSection/ReviewInfoForm';

import CartSection from './CartSection';
import InfoSection from './InfoSection';
import OrderDetailSection from './OrderDetailSection';

import css from './PriceQuotation.module.scss';

type TPriceQuotationProps = {
  data: {
    customerData: Partial<TReviewInfoFormValues> & {
      email: string;
    };
    orderData: {
      orderTitle: string;
      companyName: string;
      startDate: number;
      endDate: number;
    };
    cartData: {
      serviceFee: string;
      totalPrice: string;
      PITOFee?: string;
      promotion: string;
      totalWithVAT: string;
      transportFee: string;
      VATFee: string;
    };
    orderDetailData: {
      foodOrderGroupedByDate: TObject[];
    };
  };
};

const PriceQuotation: React.FC<TPriceQuotationProps> = ({ data }) => {
  const {
    customerData,
    cartData,
    orderData: { orderTitle, companyName, startDate, endDate },
    orderDetailData,
  } = data;
  const intl = useIntl();

  const formattedStartDate = formatTimestamp(startDate, 'dd/MM/yyyy');
  const formattedEndDate = formatTimestamp(endDate, 'dd/MM/yyyy');

  const infoSectionData = {
    ...customerData,
    companyName,
    startDate: formattedStartDate,
    endDate: formattedEndDate,
  };

  return (
    <div className={css.root} id="priceQuotation">
      <div className={css.titleContainer} id="header">
        <div>
          {intl.formatMessage(
            { id: 'BookerOrderDetailsPriceQuotation.title' },
            { orderName: orderTitle },
          )}
        </div>
        <PitoLogo className={css.PITOlogo} />
      </div>
      <div className={css.contentContainer}>
        <InfoSection id={'infoSection'} {...infoSectionData} />
        <CartSection id={'summaryPrice'} {...cartData} />
        <OrderDetailSection itemId="quoteItem" {...orderDetailData} />
      </div>
    </div>
  );
};

export default PriceQuotation;
