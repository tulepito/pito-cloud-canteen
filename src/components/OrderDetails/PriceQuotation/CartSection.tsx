import { useIntl } from 'react-intl';

import css from './CartSection.module.scss';

type TCartSectionProps = {
  id?: string;
  serviceFee?: string;
  serviceFeePrice?: string;
  totalPrice: string;
  promotion: string;
  totalWithVAT: string;
  transportFee: string;
  PITOFee?: string;
  VATFee: string;
  currentOrderVATPercentage: number;
};

const CartSection: React.FC<TCartSectionProps> = (props) => {
  const {
    id,
    serviceFeePrice,
    totalPrice,
    promotion,
    totalWithVAT,
    PITOFee,
    // transportFee,
    VATFee,
    currentOrderVATPercentage,
  } = props;
  const intl = useIntl();

  return (
    <div className={css.cartSection} id={id}>
      <div className={css.sectionTitle}>
        {intl.formatMessage({
          id: 'BookerOrderDetailsPriceQuotation.cartSection.title',
        })}
      </div>
      <div className={css.sectionContentContainer}>
        <div className={css.tableHead}>
          <div>
            {intl.formatMessage({
              id: 'BookerOrderDetailsPriceQuotation.cartSection.head.no',
            })}
          </div>
          <div>
            {intl.formatMessage({
              id: 'BookerOrderDetailsPriceQuotation.cartSection.head.type',
            })}
          </div>
          <div>
            {intl.formatMessage({
              id: 'BookerOrderDetailsPriceQuotation.cartSection.head.cost',
            })}
          </div>
        </div>
        <div className={css.tableRow}>
          <div>1</div>
          <div>
            {intl.formatMessage({
              id: 'BookerOrderDetailsPriceQuotation.cartSection.rowLabel.menuCost',
            })}
          </div>
          <div>{totalPrice}</div>
        </div>
        <div className={css.tableRow}>
          <div>2</div>
          <div>
            {intl.formatMessage({
              id: `BookerOrderDetailsPriceQuotation.cartSection.rowLabel.${
                PITOFee ? 'PITOFee' : 'serviceCost'
              }`,
            })}
          </div>
          <div>{PITOFee || serviceFeePrice}</div>
        </div>
        {/* <div className={css.tableRow}>
          <div>3</div>
          <div>
            {intl.formatMessage({
              id: 'BookerOrderDetailsPriceQuotation.cartSection.rowLabel.transportCost',
            })}
          </div>
          <div>{transportFee}</div>
        </div> */}
        <div className={css.tableRow}>
          <div>3</div>
          <div>
            {intl.formatMessage({
              id: 'BookerOrderDetailsPriceQuotation.cartSection.rowLabel.promotion',
            })}
          </div>
          <div>{promotion}</div>
        </div>
        <div className={css.tableRow}>
          <div>4</div>
          <div>
            {intl.formatMessage(
              {
                id: 'BookerOrderDetailsPriceQuotation.cartSection.rowLabel.VAT',
              },
              { percent: currentOrderVATPercentage * 100 },
            )}
          </div>
          <div>{VATFee}</div>
        </div>
        <div className={css.tableRow}>
          <div> </div>
          <div>
            {intl.formatMessage({
              id: 'BookerOrderDetailsPriceQuotation.cartSection.rowLabel.totalCost',
            })}
          </div>
          <div>{totalWithVAT}</div>
        </div>
      </div>
    </div>
  );
};

export default CartSection;
