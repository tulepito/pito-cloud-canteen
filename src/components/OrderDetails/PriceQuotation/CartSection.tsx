import { useIntl } from 'react-intl';

import css from './CartSection.module.scss';

type TCartSectionProps = {
  id?: string;
  serviceFee?: string;
  totalPrice: string;
  promotion: string;
  totalWithVAT: string;
  transportFee: string;
  PITOFee?: string;
  // VATFee: string;
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
    // VATFee,
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
                PITOFee ? 'PITOFee' : 'serviceFee'
              }`,
            })}
          </div>
          <div>{PITOFee || serviceFee}</div>
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
          <div>4</div>
          <div>
            {intl.formatMessage({
              id: 'BookerOrderDetailsPriceQuotation.cartSection.rowLabel.promotion',
            })}
          </div>
          <div>{promotion}</div>
        </div>
        {/* <div className={css.tableRow}>
              <div>5</div>
              <div>
                {intl.formatMessage(
                  {
                    id: 'BookerOrderDetailsPriceQuotation.cartSection.rowLabel.VAT',
                  },
                  { percent: config.VATPercentage * 100 },
                )}
              </div>
              <div>{VATFee}</div>
            </div> */}
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
