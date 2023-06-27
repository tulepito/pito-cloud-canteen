import { useMemo } from 'react';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

import Form from '@components/Form/Form';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
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
  onModifyQuantity: (id: string, quantity: number) => () => void;
};

export const LineItemsTableComponent: React.FC<
  TLineItemsTableComponentProps
> = ({ data = {}, onModifyQuantity }) => {
  const intl = useIntl();
  const inProgress = useAppSelector(orderDetailsAnyActionsInProgress);

  const { lineItems = [], restaurant = {} } = data;
  const { maxQuantity = 100, minQuantity = 1 } = restaurant;

  const { totalPrice, totalQuantity, formInitialValues } = useMemo(
    () =>
      lineItems.reduce(
        (result: TObject, lineItem: TObject) => {
          const { quantity = 1, price = 0 } = lineItem || {};

          return {
            ...result,
            totalPrice: result.totalPrice + price,
            totalQuantity: result.totalQuantity + quantity,
            formInitialValues: {
              ...result.formInitialValues,
              [lineItem.id]: lineItem.quantity || 1,
            },
          };
        },
        { totalPrice: 0, totalQuantity: 0, formInitialValues: {} },
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(lineItems)],
  );

  // const { form } = useForm({
  //   initialValues: formInitialValues,
  //   onSubmit: () => {},
  // });

  const shouldShowOverflowError = totalQuantity > maxQuantity;
  const shouldShowUnderError = totalQuantity < minQuantity;
  const hasError = shouldShowOverflowError || shouldShowUnderError;

  const doNothing = () => {};

  const actionDisabled = inProgress;
  const formattedTotalPrice = `${parseThousandNumber(totalPrice)}đ`;

  const bodyComponent = (
    <>
      {lineItems.map((lineItem: TObject) => {
        const { id: foodId, quantity = 1, name, price, unitPrice } = lineItem;

        const formattedFoodUnitPrice = `${parseThousandNumber(unitPrice)}đ`;
        const formattedFoodPrice = `${parseThousandNumber(price)}đ`;

        const handleChangeQuantity =
          // eslint-disable-next-line @typescript-eslint/no-shadow
          (foodId: string, quantity: number) => () => {
            return actionDisabled
              ? doNothing()
              : onModifyQuantity(foodId, quantity)();
          };

        return (
          <tr key={foodId}>
            <td title={name}>
              <div className={css.foodName}> {name}</div>
            </td>
            <td>
              <div className={css.quantityContainer}>
                <IconMinus
                  className={classNames(css.iconMinus, {
                    [css.disabled]: actionDisabled,
                  })}
                  onClick={handleChangeQuantity(foodId, quantity - 1)}
                />
                <FinalForm
                  initialValues={formInitialValues}
                  onSubmit={doNothing}
                  render={({ values }) => {
                    const handleBlurFoodQuantity = () => {
                      if (Number(values[foodId] || 1) !== Number(quantity)) {
                        if (actionDisabled) doNothing();
                        else
                          onModifyQuantity(
                            foodId,
                            Number(values[foodId] || 1),
                          )();
                      }
                    };

                    return (
                      <Form className={css.foodQuantityForm}>
                        <FieldTextInput
                          name={foodId}
                          id={`${foodId}.quantity`}
                          type="number"
                          className={css.quantityField}
                          inputClassName={css.quantityInput}
                          customOnBlur={handleBlurFoodQuantity}
                        />
                      </Form>
                    );
                  }}
                />
                <IconPlus
                  onClick={
                    actionDisabled
                      ? doNothing
                      : onModifyQuantity(foodId, quantity + 1)
                  }
                  className={classNames(css.iconPlus, {
                    [css.disabled]: actionDisabled,
                  })}
                  shouldHideCover
                />
              </div>
            </td>
            <td title={formattedFoodUnitPrice}>{formattedFoodUnitPrice}</td>
            <td>
              <RenderWhen condition={Number(price) > 0}>
                <>{formattedFoodPrice}</>
              </RenderWhen>
            </td>
            <td>
              <div className={css.actionCell}>
                <IconDelete
                  className={classNames(css.icon, {
                    [css.disabled]: actionDisabled,
                  })}
                  onClick={
                    actionDisabled ? doNothing : onModifyQuantity(foodId, 0)
                  }
                />
              </div>
            </td>
          </tr>
        );
      })}
    </>
  );

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
                <tbody>{bodyComponent}</tbody>
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
