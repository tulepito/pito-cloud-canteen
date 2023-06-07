import { useMemo } from 'react';
import { useIntl } from 'react-intl';

import IconDelete from '@components/Icons/IconDelete/IconDelete';
import IconMinus from '@components/Icons/IconMinus/IconMinus';
import IconPlus from '@components/Icons/IconPlus/IconPlus';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { parseThousandNumber } from '@helpers/format';
import { useAppSelector } from '@hooks/reduxHooks';
import { orderDetailsAnyActionsInProgress } from '@redux/slices/OrderManagement.slice';
import type { TObject } from '@src/utils/types';

import css from './LineItemsTable.module.scss';

const TABLE_HEAD_IDS = [
  'LineItemsTableComponent.head.foodName',
  'LineItemsTableComponent.head.quantity',
  'LineItemsTableComponent.head.unitPrice',
  'LineItemsTableComponent.head.price',
];

type TLineItemsTableComponentProps = {
  data: TObject;

  onClickDeleteLineItem: (id: string) => () => void;
};

export const LineItemsTableComponent: React.FC<
  TLineItemsTableComponentProps
> = ({ data = {}, onClickDeleteLineItem }) => {
  const intl = useIntl();
  const inProgress = useAppSelector(orderDetailsAnyActionsInProgress);

  const { lineItems = [], restaurant = {} } = data;
  const { maxQuantity = 100, minQuantity = 1 } = restaurant;

  const totalQuantity = useMemo(
    () =>
      lineItems.reduce((result: number, lineItem: TObject) => {
        result += lineItem?.quantity || 1;

        return result;
      }, 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(lineItems)],
  );

  const shouldShowOverflowError = totalQuantity > maxQuantity;
  const shouldShowUnderError = totalQuantity < minQuantity;
  const hasError = shouldShowOverflowError || shouldShowUnderError;

  const doNothing = () => {};

  const actionDisabled = inProgress;

  const formattedTotalPrice = `${parseThousandNumber(0)}đ`;

  return (
    <table className={css.tableRoot}>
      <thead>
        <tr>
          {TABLE_HEAD_IDS.map((headId: string, index: number) => (
            <th key={index} colSpan={index === 3 ? 2 : 1}>
              {intl.formatMessage({ id: headId })}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colSpan={5}>
            <div className={css.scrollContainer}>
              <table>
                <tbody>
                  {lineItems.map((lineItem: TObject) => {
                    const {
                      id: foodId,
                      quantity = 1,
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
                            <IconPlus
                              className={css.iconPlus}
                              shouldHideCover
                            />
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
                </tbody>
              </table>
            </div>
          </td>
        </tr>
        <tr className={css.totalRow}>
          <td colSpan={5}>
            <table>
              <tbody>
                <tr>
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
                        { count: totalQuantity },
                      )}
                    </div>
                  </td>
                  <td></td>
                  <td>{formattedTotalPrice}</td>
                  <td></td>
                </tr>
                <RenderWhen condition={hasError}>
                  <tr>
                    <td colSpan={5}>
                      <div className={css.errorText}>
                        <RenderWhen condition={shouldShowOverflowError}>
                          {intl.formatMessage({
                            id: 'LineItemsTableComponent.overflowMaxQuantity',
                          })}
                        </RenderWhen>
                        <RenderWhen condition={shouldShowUnderError}>
                          {intl.formatMessage(
                            {
                              id: 'LineItemsTableComponent.underMinQuantity',
                            },
                            { minQuantity },
                          )}
                        </RenderWhen>
                      </div>
                    </td>
                  </tr>
                </RenderWhen>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
};
