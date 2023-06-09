/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo, useRef } from 'react';
import { useField, useForm } from 'react-final-form-hooks';
import { useIntl } from 'react-intl';
import isEmpty from 'lodash/isEmpty';

import Button from '@components/Button/Button';
import { FieldSelectComponent } from '@components/FormFields/FieldSelect/FieldSelect';
import { FieldTextAreaComponent } from '@components/FormFields/FieldTextArea/FieldTextArea';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  orderDetailsAnyActionsInProgress,
  orderManagementThunks,
} from '@redux/slices/OrderManagement.slice';
import { Listing } from '@src/utils/data';
import type { TListing, TObject } from '@src/utils/types';

import { LineItemsTableComponent } from './LineItemsTableComponent';

import css from './LineItemsTable.module.scss';

const DEBOUNCE_TIME = 200;
const NOTE_DEBOUNCE_TIME = 300;

type TLineItemsTableProps = {
  currentViewDate: number;
};

const LineItemsTable: React.FC<TLineItemsTableProps> = (props) => {
  const { currentViewDate } = props;
  const intl = useIntl();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const noteDebounceRef = useRef<ReturnType<typeof setTimeout>>();
  const dispatch = useAppDispatch();
  const inProgress = useAppSelector(orderDetailsAnyActionsInProgress);
  const { planData } = useAppSelector((state) => state.OrderManagement);

  const planDataGetter = Listing(planData as TListing);
  const planId = planDataGetter.getId();
  const { orderDetail = {}, orderId } = planDataGetter.getMetadata();
  const data = orderDetail[currentViewDate] || {};
  const { lineItems = [], restaurant = {}, note } = data;
  const { foodList = {} } = restaurant;

  const { form, handleSubmit } = useForm({
    initialValues: {
      note,
    },
    onSubmit: () => {},
  });
  const foodField = useField(`food`, form);
  const noteField = useField(`note`, form);

  let currDebounceRef = debounceRef.current;
  let currNoteDebounceRef = noteDebounceRef.current;

  const noteInput = {
    ...noteField.input,
    onBlur: () => {
      noteField.input.onBlur();
      const newValue = noteField.input.value;

      if (newValue === note) {
        return;
      }

      if (currNoteDebounceRef) {
        clearTimeout(currNoteDebounceRef);
      }

      const updateOrderDetail = {
        ...orderDetail,
        [currentViewDate]: {
          ...data,
          note: newValue,
        },
      };

      currNoteDebounceRef = setTimeout(() => {
        dispatch(
          orderManagementThunks.updatePlanOrderDetail({
            orderId,
            planId,
            orderDetail: updateOrderDetail,
          }),
        );
      }, NOTE_DEBOUNCE_TIME);
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

  const disabledAddLineItem = inProgress || isEmpty(foodOptions);

  const handleModifyQuantity =
    (foodId: string, quantity: number = 1) =>
    () => {
      if (currDebounceRef) {
        clearTimeout(currDebounceRef);
      }

      const itemIndex = lineItems.findIndex((x: TObject) => x?.id === foodId);
      let newLineItems = lineItems;

      if (itemIndex === -1) {
        const { foodPrice, foodName } = foodList[foodId];

        newLineItems = newLineItems.concat({
          id: foodId,
          name: foodName,
          unitPrice: foodPrice,
          price: foodPrice,
          quantity,
        });
      } else if (quantity === 0) {
        newLineItems = lineItems.toSpliced(itemIndex, 1);
      } else {
        const item = lineItems[itemIndex];
        const { unitPrice } = lineItems[itemIndex];

        newLineItems = lineItems.toSpliced(itemIndex, 1, {
          ...item,
          price: unitPrice * quantity,
          quantity,
        });
      }

      const updateOrderDetail = {
        ...orderDetail,
        [currentViewDate]: {
          ...data,
          lineItems: newLineItems,
        },
      };

      currDebounceRef = setTimeout(() => {
        dispatch(
          orderManagementThunks.updatePlanOrderDetail({
            orderId,
            planId,
            orderDetail: updateOrderDetail,
          }),
        );
      }, DEBOUNCE_TIME);
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

  return (
    <div className={css.root}>
      <LineItemsTableComponent
        data={data}
        onModifyQuantity={handleModifyQuantity}
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
              disabled={disabledAddLineItem}
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
        </div>

        <div className={css.fieldContainer}>
          <label className={css.fieldLabel} htmlFor="LineItemsTable.note">
            {intl.formatMessage({ id: 'LineItemsTable.addNoteField.label' })}
          </label>
          <FieldTextAreaComponent
            disabled={inProgress}
            id={`note`}
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
