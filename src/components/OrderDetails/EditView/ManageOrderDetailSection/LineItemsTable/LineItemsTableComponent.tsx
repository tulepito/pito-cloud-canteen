import { useEffect, useMemo } from 'react';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

import Alert from '@components/Alert/Alert';
import Form from '@components/Form/Form';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconDelete from '@components/Icons/IconDelete/IconDelete';
import IconMinus from '@components/Icons/IconMinus/IconMinus';
import IconPlus from '@components/Icons/IconPlus/IconPlus';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { parseThousandNumber } from '@helpers/format';
import { useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { useViewport } from '@hooks/useViewport';
import { orderDetailsAnyActionsInProgress } from '@redux/slices/OrderManagement.slice';
import { Listing } from '@src/utils/data';
import type { TListing, TObject } from '@src/utils/types';

import css from './LineItemsTable.module.scss';

const TABLE_HEAD_IDS = [
  'LineItemsTableComponent.head.foodName',
  'LineItemsTableComponent.head.quantity',
  'LineItemsTableComponent.head.unitPrice',
  'LineItemsTableComponent.head.price',
];

const MOBILE_TABLE_HEAD_IDS = [
  'LineItemsTableComponent.head.foodName',
  'LineItemsTableComponent.head.mobileQuantity',
  'LineItemsTableComponent.head.unitPrice',
  'LineItemsTableComponent.head.price',
];

type TLineItemsTableComponentProps = {
  data: TObject;
  onModifyQuantity: (id: string, quantity: number) => () => void;
  ableToUpdateOrder: boolean;
  isAdminFlow?: boolean;
};

export const LineItemsTableComponent: React.FC<
  TLineItemsTableComponentProps
> = ({
  data = {},
  onModifyQuantity,
  ableToUpdateOrder,
  isAdminFlow = false,
}) => {
  const intl = useIntl();
  const inProgress = useAppSelector(orderDetailsAnyActionsInProgress);
  const orderData = useAppSelector((state) => state.OrderManagement.orderData);
  const { isMobileLayout } = useViewport();
  const alertController = useBoolean();

  const orderDataGetter = Listing(orderData as TListing);
  const { memberAmount = 1 } = orderDataGetter.getMetadata();

  const { lineItems = [] } = data;

  const tableHeadIds = isMobileLayout ? MOBILE_TABLE_HEAD_IDS : TABLE_HEAD_IDS;

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

  const overFlowAmount = totalQuantity - memberAmount;
  const overFlowMemberAmountMessage = intl.formatMessage(
    { id: 'LineItemsTable.overFlowMemberAmount' },
    { amount: overFlowAmount },
  );

  const doNothing = () => {};

  const actionDisabled = inProgress || !ableToUpdateOrder;
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
              <div className={css.foodName}>
                <RenderWhen condition={isMobileLayout}>
                  <div className={css.name}> {name}</div>
                  <div className={css.foodUnit}> {formattedFoodUnitPrice}</div>

                  <RenderWhen.False>{name}</RenderWhen.False>
                </RenderWhen>
              </div>
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
                          disabled={actionDisabled}
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

  useEffect(() => {
    if (overFlowAmount > 0) {
      alertController.setTrue();
    } else if (overFlowAmount === 0) {
      alertController.setFalse();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overFlowAmount]);

  return (
    <>
      <Alert
        className={classNames(css.overFlowAlert, {
          [css.isAdminLayout]: isAdminFlow,
        })}
        openClassName={css.isOpen}
        message={overFlowMemberAmountMessage}
        isOpen={alertController.value}
        onClose={() => alertController.setFalse()}
      />
      <table className={css.tableRoot}>
        <thead>
          <tr>
            {tableHeadIds.map((headId: string, index: number) => (
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
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
};
