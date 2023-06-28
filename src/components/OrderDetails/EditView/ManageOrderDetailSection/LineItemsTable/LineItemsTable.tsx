/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo } from 'react';
import { useField, useForm } from 'react-final-form-hooks';
import { useIntl } from 'react-intl';
import difference from 'lodash/difference';
import isEmpty from 'lodash/isEmpty';

import Button from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import { FieldSelectComponent } from '@components/FormFields/FieldSelect/FieldSelect';
import { FieldTextAreaComponent } from '@components/FormFields/FieldTextArea/FieldTextArea';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  orderDetailsAnyActionsInProgress,
  OrderManagementsAction,
  orderManagementThunks,
} from '@redux/slices/OrderManagement.slice';
import { Listing } from '@src/utils/data';
import type { TListing, TObject } from '@src/utils/types';

import { LineItemsTableComponent } from './LineItemsTableComponent';

import css from './LineItemsTable.module.scss';

type TLineItemsTableProps = {
  currentViewDate: number;
  isDraftEditing: boolean;
  ableToUpdateOrder: boolean;
  shouldShowOverflowError: boolean;
  shouldShowUnderError: boolean;
  minQuantity: number;
};

const LineItemsTable: React.FC<TLineItemsTableProps> = (props) => {
  const {
    currentViewDate,
    isDraftEditing,
    ableToUpdateOrder,
    shouldShowOverflowError,
    shouldShowUnderError,
    minQuantity,
  } = props;
  const intl = useIntl();

  const dispatch = useAppDispatch();
  const inProgress = useAppSelector(orderDetailsAnyActionsInProgress);
  const { planData, draftOrderDetail } = useAppSelector(
    (state) => state.OrderManagement,
  );

  const planDataGetter = Listing(planData as TListing);
  const planId = planDataGetter.getId();
  const { orderId } = planDataGetter.getMetadata();
  const data = draftOrderDetail[currentViewDate] || {};
  const { lineItems = [], restaurant = {} } = data as any;
  const { foodList = {} } = restaurant;

  const note = useMemo(() => data?.note || '', [currentViewDate]);
  const { form, handleSubmit } = useForm({
    initialValues: {
      note,
    },
    onSubmit: () => {},
  });
  const foodField = useField(`food`, form);
  const noteField = useField(`note`, form);

  const noteInput = {
    ...noteField.input,
    onBlur: () => {
      noteField.input.onBlur();
      const newValue = noteField.input.value;

      if (newValue === note) {
        return;
      }

      const currentViewData = {
        ...data,
        note: newValue,
      };

      const updateOrderDetail = {
        ...draftOrderDetail,
        [currentViewDate]: currentViewData,
      };
      if (isDraftEditing) {
        dispatch(
          OrderManagementsAction.setDraftOrderDetails(updateOrderDetail),
        );
      } else {
        dispatch(
          orderManagementThunks.updatePlanOrderDetail({
            orderId,
            planId,
            orderDetail: updateOrderDetail,
          }),
        );
      }
    },
  };

  const foodOptions = useMemo(() => {
    return Object.entries<TObject>(foodList).reduce<
      { id: string; name: string }[]
    >((result, entry) => {
      const [foodId, foodData] = entry;

      const itemIndex = lineItems.findIndex((x: TObject) => x?.id === foodId);

      return itemIndex === -1
        ? result.concat({
            id: foodId as string,
            name: foodData?.foodName || '',
          })
        : result;
    }, []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(foodList), JSON.stringify(lineItems)]);

  const disabledSelectFood =
    inProgress || isEmpty(foodOptions) || !ableToUpdateOrder;
  const disabledAddLineItem =
    inProgress ||
    isEmpty(foodOptions) ||
    isEmpty(foodField.input.value) ||
    !ableToUpdateOrder;

  const handleModifyQuantity =
    (foodId: string, quantity: number = 1) =>
    () => {
      const itemIndex = lineItems.findIndex((x: TObject) => x?.id === foodId);
      let newLineItems = lineItems;

      const { foodPrice, foodName } = foodList[foodId];

      if (itemIndex === -1) {
        newLineItems = newLineItems.concat({
          id: foodId,
          name: foodName,
          unitPrice: foodPrice,
          price: foodPrice,
          quantity,
        });
      } else if (quantity === 0) {
        newLineItems = difference(lineItems, [lineItems[itemIndex]]);
      } else {
        const item = lineItems[itemIndex];
        const { unitPrice } = lineItems[itemIndex];
        const newLineItem = {
          ...item,
          price: unitPrice * quantity,
          quantity,
        };
        newLineItems = difference(lineItems, [lineItems[itemIndex]]);
        newLineItems = [
          ...newLineItems.slice(0, itemIndex),
          newLineItem,
          ...newLineItems.slice(itemIndex),
        ];
      }

      const updateOrderDetail = {
        ...draftOrderDetail,
        [currentViewDate]: {
          ...data,
          lineItems: newLineItems,
        },
      };

      if (isDraftEditing) {
        dispatch(
          OrderManagementsAction.setDraftOrderDetailsAndSubOrderChangeHistory({
            newOrderDetail: updateOrderDetail,
            updateValues: {
              currentViewDate,
              foodName,
              foodPrice,
              quantity,
              foodId,
            },
          }),
        );
      } else {
        dispatch(
          orderManagementThunks.updatePlanOrderDetail({
            orderId,
            planId,
            orderDetail: updateOrderDetail,
          }),
        );
      }
    };

  const handleAddNewLineItem = () => {
    const foodId = foodField?.input?.value;

    if (foodId) {
      handleModifyQuantity(foodId)();

      if (foodField?.input?.onChange) {
        foodField.input.onChange('');
      }
    }
  };

  useEffect(() => {
    form.reset();
  }, [currentViewDate]);

  return (
    <div className={css.root}>
      <LineItemsTableComponent
        data={data}
        onModifyQuantity={handleModifyQuantity}
        ableToUpdateOrder={ableToUpdateOrder}
      />
      <form onSubmit={handleSubmit}>
        <div className={css.fieldContainer}>
          <label className={css.fieldLabel}>
            {intl.formatMessage({ id: 'LineItemsTable.addFoodField.label' })}
          </label>

          <div className={css.fieldRow}>
            <FieldSelectComponent
              id={`food`}
              name={`food`}
              className={css.fieldSelect}
              disabled={disabledSelectFood}
              meta={foodField.meta}
              input={foodField.input}>
              <option disabled value="">
                {intl.formatMessage({
                  id: 'LineItemsTable.addFoodField.placeholder',
                })}
              </option>
              {foodOptions.map(({ id, name }) => {
                return (
                  <option key={id} value={id}>
                    {name}
                  </option>
                );
              })}
            </FieldSelectComponent>

            <Button
              onClick={handleAddNewLineItem}
              disabled={disabledAddLineItem}>
              {intl.formatMessage({
                id: 'LineItemsTable.addFoodField.buttonText',
              })}
            </Button>
          </div>
          {isDraftEditing && shouldShowOverflowError && (
            <ErrorMessage
              className={css.error}
              message={`Bạn đã thay đổi vượt mức quy định (tối đa 10% số lượng người tham gia)`}
            />
          )}
          {isDraftEditing && shouldShowUnderError && (
            <ErrorMessage
              className={css.error}
              message={`Cần đặt tối thiểu ${minQuantity} phần`}
            />
          )}
        </div>

        <div className={css.fieldContainer}>
          <label className={css.fieldLabel} htmlFor="LineItemsTable.note">
            {intl.formatMessage({ id: 'LineItemsTable.addNoteField.label' })}
          </label>
          <FieldTextAreaComponent
            disabled={inProgress || !ableToUpdateOrder}
            id={`${currentViewDate}.note`}
            name={`note`}
            className={css.fieldNote}
            placeholder={intl.formatMessage({
              id: 'LineItemsTable.addNoteField.placeholder',
            })}
            meta={noteField.meta}
            input={noteInput}
          />
        </div>
      </form>
    </div>
  );
};

export default LineItemsTable;
