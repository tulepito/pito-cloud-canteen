import Button from '@components/Button/Button';
import { useAppSelector } from '@hooks/reduxHooks';
import React from 'react';
import { useField, useForm } from 'react-final-form-hooks';
import { FormattedMessage } from 'react-intl';

import css from './DishSelectionForm.module.scss';

type TDishSelectionFormProps = {
  dishes: {
    key: string;
    value: string;
  }[];
  onSubmit: (values: TDishSelectionFormValues, reject?: boolean) => void;
  initialValues: TDishSelectionFormValues;
};

export type TDishSelectionFormValues = {
  dishSelection: string;
};

const validate = (values: TDishSelectionFormValues) => {
  const errors: any = {};
  if (!values.dishSelection) {
    errors.dishSelection = 'Required';
  }
  return errors;
};

const DishSelectionForm: React.FC<TDishSelectionFormProps> = ({
  dishes,
  onSubmit,
  initialValues,
}) => {
  const handleCustomSubmit = (values: TDishSelectionFormValues) => {
    onSubmit(values);
  };

  const { updateOrderError, updateOrderInProgress } = useAppSelector(
    (state) => state.ParticipantOrderManagementPage,
  );

  const { form, handleSubmit, values, submitting, hasValidationErrors } =
    useForm<TDishSelectionFormValues>({
      onSubmit: handleCustomSubmit,
      validate,
    });

  const handleReject = () => {
    onSubmit(values, true);
  };

  const dishSelection = useField('dishSelection', form);
  const disabledSubmit = submitting || hasValidationErrors;
  const disabledRejectButton = updateOrderInProgress || updateOrderError;

  const hasValues = values && !!values.dishSelection;
  const rejectSubmitting = !hasValues && updateOrderInProgress;
  const submitSubmitting = hasValues && updateOrderInProgress;

  return (
    <form className={css.root} onSubmit={handleSubmit}>
      {dishes.map((dish, index) => (
        <label
          key={index}
          className={css.radioLabel}
          htmlFor={`dishSelection-${index}`}>
          <input
            {...dishSelection.input}
            className={css.radioInput}
            type={'radio'}
            value={dish.key}
            defaultChecked={dish.key === initialValues.dishSelection}
            id={`dishSelection-${index}`}
            name="dishSelection"
          />
          {dish.value}
        </label>
      ))}
      <div className={css.actions}>
        <Button
          type="button"
          className={css.rejectBtn}
          onClick={handleReject}
          disabled={disabledRejectButton}
          inProgress={rejectSubmitting}>
          <FormattedMessage id="DishSelectionForm.reject" />
        </Button>
        <Button
          className={css.acceptBtn}
          type="submit"
          disabled={disabledSubmit}
          inProgress={submitSubmitting}
          spinnerClassName={css.spinnerClassName}>
          <FormattedMessage id="DishSelectionForm.accept" />
        </Button>
      </div>
    </form>
  );
};

export default DishSelectionForm;
