import { useIntl } from 'react-intl';

import RenderWhen from '@components/RenderWhen/RenderWhen';
import { EPartnerVATSetting } from '@src/utils/enums';

import css from './CartSection.module.scss';

type TCartSectionProps = {
  id?: string;
  serviceFee?: string;
  totalPrice: string;
  promotion: string;
  totalWithVAT: string;
  transportFee: string;
  PITOFee?: string;
  VATFee: string;
  isPartnerQuotation?: boolean;
  vatPercentage: number;
  vatSetting: EPartnerVATSetting;
};

const CartSection: React.FC<TCartSectionProps> = (props) => {
  const {
    id,
    serviceFee,

    totalPrice,
    promotion,
    totalWithVAT,
    PITOFee,
    // transportFee,
    VATFee,
    isPartnerQuotation = false,
    vatPercentage,
    vatSetting = EPartnerVATSetting.vat,
  } = props;
  const intl = useIntl();

  const shouldSkipVAT = vatSetting === EPartnerVATSetting.direct;

  return (
    <div className={css.cartSection} id={id}>
      <div className={css.sectionTitle}>
        {intl.formatMessage({
          id: 'OrderDetails.PriceQuotation.cartSection.title',
        })}
      </div>
      <div className={css.sectionContentContainer}>
        <div className={css.tableHead}>
          <div>
            {intl.formatMessage({
              id: 'OrderDetails.PriceQuotation.cartSection.head.no',
            })}
          </div>
          <div>
            {intl.formatMessage({
              id: 'OrderDetails.PriceQuotation.cartSection.head.type',
            })}
          </div>
          <div>
            {intl.formatMessage({
              id: 'OrderDetails.PriceQuotation.cartSection.head.cost',
            })}
          </div>
        </div>
        <div className={css.tableRow}>
          <div>1</div>
          <div>
            {intl.formatMessage({
              id: 'OrderDetails.PriceQuotation.cartSection.rowLabel.menuCost',
            })}
          </div>
          <div>{totalPrice}</div>
        </div>
        <div className={css.tableRow}>
          <div>2</div>
          <div>
            {intl.formatMessage({
              id: `OrderDetails.PriceQuotation.cartSection.rowLabel.${
                isPartnerQuotation ? 'serviceCost' : 'PITOFee'
              }`,
            })}
          </div>
          <div>{isPartnerQuotation ? serviceFee : PITOFee}</div>
        </div>
        {/* <div className={css.tableRow}>
          <div>3</div>
          <div>
            {intl.formatMessage({
              id: 'OrderDetails.PriceQuotation.cartSection.rowLabel.transportCost',
            })}
          </div>
          <div>{transportFee}</div>
        </div> */}
        <div className={css.tableRow}>
          <div>3</div>
          <div>
            {intl.formatMessage({
              id: 'OrderDetails.PriceQuotation.cartSection.rowLabel.promotion',
            })}
          </div>
          <div>{promotion}</div>
        </div>

        <RenderWhen condition={!shouldSkipVAT}>
          <div className={css.tableRow}>
            <div>4</div>
            <div>
              <RenderWhen
                condition={vatSetting === EPartnerVATSetting.noExportVat}>
                {intl.formatMessage(
                  {
                    id: 'OrderDetails.PriceQuotation.cartSection.rowLabel.noExportVAT',
                  },
                  { percent: Math.abs(vatPercentage * 100) },
                )}
                <RenderWhen.False>
                  {intl.formatMessage(
                    {
                      id: 'OrderDetails.PriceQuotation.cartSection.rowLabel.VAT',
                    },
                    { percent: vatPercentage * 100 },
                  )}
                </RenderWhen.False>
              </RenderWhen>
            </div>
            <div>{VATFee}</div>
          </div>
        </RenderWhen>
        <div className={css.tableRow}>
          <div> </div>
          <div>
            {intl.formatMessage({
              id: 'OrderDetails.PriceQuotation.cartSection.rowLabel.totalCost',
            })}
          </div>
          <div>{totalWithVAT}</div>
        </div>
      </div>
    </div>
  );
};

export default CartSection;
