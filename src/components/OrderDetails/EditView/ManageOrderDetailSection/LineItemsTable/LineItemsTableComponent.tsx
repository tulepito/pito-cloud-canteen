import { useIntl } from 'react-intl';

import IconDelete from '@components/Icons/IconDelete/IconDelete';
import IconMinus from '@components/Icons/IconMinus/IconMinus';
import IconPlus from '@components/Icons/IconPlus/IconPlus';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { parseThousandNumber } from '@helpers/format';
import { useAppSelector } from '@hooks/reduxHooks';
import { orderDetailsAnyActionsInProgress } from '@redux/slices/OrderManagement.slice';

import css from './LineItemsTable.module.scss';

type TLineItemsTableComponentProps = {
  data: any[];

  onClickDeleteLineItem: (id: string) => () => void;
};

export const LineItemsTableComponent: React.FC<
  TLineItemsTableComponentProps
> = ({ data, onClickDeleteLineItem }) => {
  const intl = useIntl();
  const inProgress = useAppSelector(orderDetailsAnyActionsInProgress);

  const doNothing = () => {};

  const actionDisabled = inProgress;
  const tableHeads = [
    'LineItemsTableComponent.head.foodName',
    'LineItemsTableComponent.head.quantity',
    'LineItemsTableComponent.head.unitPrice',
    'LineItemsTableComponent.head.price',
  ];

  const formattedTotalPrice = `${parseThousandNumber(0)}đ`;

  return (
    <table className={css.tableRoot}>
      <thead>
        <tr>
          {tableHeads.map((headId: string, index: number) => (
            <th key={index}>{intl.formatMessage({ id: headId })}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colSpan={5}>
            <div className={css.scrollContainer}>
              <table>
                {data.map((lineItem) => {
                  const {
                    id: foodId,
                    quantity,
                    name,
                    price,
                    unitPrice,
                  } = lineItem;

                  const formattedFoodUnitPrice = `${parseThousandNumber(
                    unitPrice,
                  )}đ`;
                  const formattedFoodPrice = `${parseThousandNumber(price)}đ`;

                  return (
                    <tr key={foodId}>
                      <td title={name}>
                        <div className={css.foodName}> {name}</div>
                      </td>
                      <td title={quantity}>
                        <div className={css.quantityContainer}>
                          <IconMinus className={css.iconMinus} />
                          <div className={css.quantityValue}>{quantity}</div>
                          <IconPlus className={css.iconPlus} shouldHideCover />
                        </div>
                      </td>
                      <td title={formattedFoodUnitPrice}>
                        {formattedFoodUnitPrice}
                      </td>
                      <td>
                        <RenderWhen condition={Number(price) > 0}>
                          <>{formattedFoodPrice}</>
                        </RenderWhen>
                      </td>
                      <td>
                        <div className={css.actionCell}>
                          <IconDelete
                            className={css.icon}
                            onClick={
                              actionDisabled
                                ? doNothing
                                : onClickDeleteLineItem(foodId)
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </table>
            </div>
          </td>
        </tr>
        <tr className={css.totalRow}>
          <td>
            <div className={css.totalText}>
              {intl.formatMessage({
                id: 'LineItemsTableComponent.totalLabel',
              })}
            </div>
          </td>
          <td>
            <div>
              {intl.formatMessage(
                {
                  id: 'LineItemsTableComponent.totalQuantity',
                },
                { count: data?.length },
              )}
            </div>
          </td>
          <td></td>
          <td>{formattedTotalPrice}</td>
          <td></td>
        </tr>
      </tbody>
    </table>
  );
};
