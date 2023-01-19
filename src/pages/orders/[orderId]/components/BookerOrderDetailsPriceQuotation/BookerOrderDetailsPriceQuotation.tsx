import PitoLogo from '@components/PitoLogo/PitoLogo';
import config from '@src/configs';
import type { TObject } from '@utils/types';
import type { LocaleOptions } from 'luxon';
import { DateTime } from 'luxon';
import { useIntl } from 'react-intl';

import type { TReviewInfoFormValues } from '../BookerOrderDetailsReviewView/ReviewInfoSection/ReviewInfoForm';
import css from './BookerOrderDetailsPriceQuotation.module.scss';

const formatDate = (
  date: number,
  formatStr: string = 'dd/MM/yyyy',
  options?: LocaleOptions,
) => {
  return DateTime.fromMillis(date).toFormat(formatStr, options);
};

type TBookerOrderDetailsPriceQuotationProps = {
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

const BookerOrderDetailsPriceQuotation: React.FC<
  TBookerOrderDetailsPriceQuotationProps
> = ({ data }) => {
  const intl = useIntl();

  const {
    customerData: {
      contactPhoneNumber,
      contactPeopleName,
      email,
      deliveryAddress: { search: deliveryAddress } = {},
    },
    orderData: { orderTitle, companyName, startDate, endDate },
    cartData: {
      serviceFee,
      totalPrice,
      promotion,
      totalWithVAT,
      transportFee,
      VATFee,
    },
    orderDetailData: { foodOrderGroupedByDate },
  } = data;

  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);

  return (
    <div className={css.root} id="priceQuotation">
      <div className={css.titleContainer}>
        <div>
          {intl.formatMessage(
            { id: 'BookerOrderDetailsPriceQuotation.title' },
            { orderName: orderTitle },
          )}
        </div>
        <PitoLogo className={css.PITOlogo} />
      </div>
      <div className={css.contentContainer}>
        <div className={css.infoContainer}>
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
                    { start: formattedStartDate, end: formattedEndDate },
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
        <div className={css.cartSection}>
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
                  id: 'BookerOrderDetailsPriceQuotation.cartSection.rowLabel.serviceCost',
                })}
              </div>
              <div>{serviceFee}</div>
            </div>
            <div className={css.tableRow}>
              <div>3</div>
              <div>
                {intl.formatMessage({
                  id: 'BookerOrderDetailsPriceQuotation.cartSection.rowLabel.transportCost',
                })}
              </div>
              <div>{transportFee}</div>
            </div>
            <div className={css.tableRow}>
              <div>4</div>
              <div>
                {intl.formatMessage({
                  id: 'BookerOrderDetailsPriceQuotation.cartSection.rowLabel.promotion',
                })}
              </div>
              <div>{promotion}</div>
            </div>
            <div className={css.tableRow}>
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
        <div className={css.orderDetailSection}>
          <div className={css.sectionTitle}>
            {intl.formatMessage({
              id: 'BookerOrderDetailsPriceQuotation.orderDetailSection.title',
            })}
          </div>
          <div className={css.sectionContentContainer}>
            <div className={css.tableHead}>
              <div>
                {intl.formatMessage({
                  id: 'BookerOrderDetailsPriceQuotation.orderDetailSection.head.no',
                })}
              </div>
              <div>
                {intl.formatMessage({
                  id: 'BookerOrderDetailsPriceQuotation.orderDetailSection.head.type',
                })}
              </div>
              <div>
                {intl.formatMessage({
                  id: 'BookerOrderDetailsPriceQuotation.orderDetailSection.head.quantity',
                })}
              </div>
              <div>
                {intl.formatMessage({
                  id: 'BookerOrderDetailsPriceQuotation.orderDetailSection.head.cost',
                })}
              </div>
            </div>

            {foodOrderGroupedByDate.map((dateData) => {
              const {
                date,
                totalDishes,
                totalPrice: totalPriceOfDate,
                foodDataList,
                restaurantName,
                index,
              } = dateData;
              const formattedDate = DateTime.fromMillis(Number(date)).toFormat(
                'EEE, dd/MM/yyyy',
                { locale: 'vi' },
              );

              return (
                <div className={css.tableRowGroup} key={date}>
                  <div className={css.groupTitle}>
                    <div>{index + 1}</div>
                    <div>
                      {formattedDate}
                      <div className={css.restaurantName}>{restaurantName}</div>
                    </div>
                    <div>{totalDishes}</div>
                    <div>{totalPriceOfDate}đ</div>
                  </div>
                  <div className={css.rows}>
                    {foodDataList.map((foodData: TObject) => {
                      const { foodId, foodPrice, foodName, frequency } =
                        foodData;

                      return (
                        <div className={css.row} key={foodId}>
                          <div></div>
                          <div>{foodName}</div>
                          <div>{frequency}</div>
                          <div>{foodPrice}đ</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookerOrderDetailsPriceQuotation;
