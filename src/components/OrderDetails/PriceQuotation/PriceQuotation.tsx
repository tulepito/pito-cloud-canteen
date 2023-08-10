import { useIntl } from 'react-intl';

import PitoLogo from '@components/PitoLogo/PitoLogo';
import { EPartnerVATSetting } from '@src/utils/enums';
import { formatTimestamp } from '@utils/dates';
import type { TObject } from '@utils/types';

import type { TReviewInfoFormValues } from '../ReviewView/ReviewInfoSection/ReviewInfoForm';

import CartSection from './CartSection';
import InfoSection from './InfoSection';
import OrderDetailSection from './OrderDetailSection';

import css from './PriceQuotation.module.scss';

type TPriceQuotationProps = {
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
    };
    cartData: {
      serviceFee: string;
      serviceFeePrice?: string;
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
}) => {
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

  const cartProps = {
    ...cartData,
    isPartnerQuotation,
    vatSetting,
  };

  return (
    <div className={css.root} id="priceQuotation">
      <div className={css.titleContainer} id="header">
        <div>
          {intl.formatMessage(
            { id: 'OrderDetails.PriceQuotation.title' },
            { orderName: orderTitle },
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
