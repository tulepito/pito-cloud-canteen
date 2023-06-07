import { useField, useForm } from 'react-final-form-hooks';
import { useIntl } from 'react-intl';

import Button from '@components/Button/Button';
import { FieldSelectComponent } from '@components/FormFields/FieldSelect/FieldSelect';
import { FieldTextAreaComponent } from '@components/FormFields/FieldTextArea/FieldTextArea';
import { useAppSelector } from '@hooks/reduxHooks';
import { Listing } from '@src/utils/data';
import type { TListing } from '@src/utils/types';

import { LineItemsTableComponent } from './LineItemsTableComponent';

import css from './LineItemsTable.module.scss';

type TLineItemsTableProps = {
  currentViewDate: number;
};

const LineItemsTable: React.FC<TLineItemsTableProps> = (props) => {
  const { currentViewDate } = props;
  const intl = useIntl();
  const { form, handleSubmit } = useForm({
    initialValues: {},
    onSubmit: () => {},
  });
  const foodField = useField('food', form);
  const noteField = useField('note', form);

  const { planData } = useAppSelector((state) => state.OrderManagement);

  const { orderDetail = {} } = Listing(planData as TListing).getMetadata();
  const data = orderDetail[currentViewDate];

  return (
    <div className={css.root}>
      <LineItemsTableComponent
        data={data}
        onClickDeleteLineItem={() => () => {}}
      />
      <form onSubmit={handleSubmit}>
        <div className={css.fieldContainer}>
          <label className={css.fieldLabel}>
            {intl.formatMessage({ id: 'LineItemsTable.addFoodField.label' })}
          </label>

          <div className={css.fieldRow}>
            <FieldSelectComponent
              id="LineItemsTable.food"
              name="food"
              className={css.fieldSelect}
              meta={foodField.meta}
              input={foodField.input}>
              <option disabled value="">
                {intl.formatMessage({
                  id: 'LineItemsTable.addFoodField.placeholder',
                })}
              </option>
            </FieldSelectComponent>

            <Button>
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
            id="LineItemsTable.note"
            className={css.fieldNote}
            name="note"
            placeholder={intl.formatMessage({
              id: 'LineItemsTable.addNoteField.placeholder',
            })}
            meta={noteField.meta}
            input={noteField.input}
          />
        </div>
      </form>
    </div>
  );
};

export default LineItemsTable;
