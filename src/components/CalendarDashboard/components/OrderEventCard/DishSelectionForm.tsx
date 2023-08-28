import { useState } from 'react';
import { useField, useForm } from 'react-final-form-hooks';
import classNames from 'classnames';

import Button from '@components/Button/Button';
import { EVENT_STATUS } from '@components/CalendarDashboard/helpers/constant';
import { useAppSelector } from '@hooks/reduxHooks';
import { EParticipantOrderStatus } from '@src/utils/enums';

import css from './DishSelectionForm.module.scss';

type TDishSelectionFormProps = {
  dishes: {
    key: string;
    value: string;
  }[];
  onSubmit: (values: TDishSelectionFormValues, reject?: boolean) => void;
  initialValues: TDishSelectionFormValues;
  actionsDisabled: boolean;
  subOrderStatus?: string;
  onPickForMe: () => void;
  pickForMeInProgress?: boolean;
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
  actionsDisabled = false,
  subOrderStatus = EVENT_STATUS.EMPTY_STATUS,
  onPickForMe,
  pickForMeInProgress,
}) => {
  const [clickedType, setClickedType] = useState<
    'reject' | 'submit' | undefined
  >(undefined);
  const handleCustomSubmit = (values: TDishSelectionFormValues) => {
    setClickedType('submit');
    onSubmit(values);
  };

  const { updateOrderError, updateOrderInProgress } = useAppSelector(
    (state) => state.ParticipantOrderManagementPage,
  );

  const updateSubOrderInProgress = useAppSelector(
    (state) => state.ParticipantOrderList.updateSubOrderInProgress,
  );

  const {
    form,
    handleSubmit,
    values,
    submitting,
    hasValidationErrors,
    pristine,
  } = useForm<TDishSelectionFormValues>({
    onSubmit: handleCustomSubmit,
    validate,
    initialValues,
  });

  const handleReject = () => {
    setClickedType('reject');
    onSubmit(values, true);
  };

  const handlePickForMe = () => {
    onPickForMe();
  };

  const dishSelection = useField('dishSelection', form);
  const disabledSubmit =
    actionsDisabled || submitting || hasValidationErrors || pristine;
  const disabledRejectButton =
    actionsDisabled ||
    updateOrderInProgress ||
    updateOrderError ||
    subOrderStatus === EParticipantOrderStatus.notJoined;

  const rejectSubmitting =
    clickedType === 'reject' &&
    (updateOrderInProgress || updateSubOrderInProgress);
  const confirmSubmitting =
    clickedType === 'submit' &&
    (updateOrderInProgress || updateSubOrderInProgress);

  return (
    <form className={css.root} onSubmit={handleSubmit}>
      <div className={css.fieldGroup}>
        {dishes.map((dish, index) => (
          <label
            key={`${index}_${initialValues.dishSelection}`}
            className={css.radioLabel}
            title={dish.value}
            htmlFor={`dishSelection-${index}`}>
            <input
              {...dishSelection.input}
              className={css.radioInput}
              disabled={actionsDisabled}
              type={'radio'}
              value={dish.key}
              defaultChecked={dish.key === initialValues.dishSelection}
              id={`dishSelection-${index}`}
              name="dishSelection"
            />
            <span>{dish.value}</span>
          </label>
        ))}
      </div>
      <div className={css.sectionWrapper}>
        <div className={css.row}>
          <Button
            className={css.btn}
            variant="secondary"
            type="button"
            onClick={handlePickForMe}
            inProgress={pickForMeInProgress}>
            Chọn giúp tôi
          </Button>
          <Button
            className={css.btn}
            type="submit"
            disabled={disabledSubmit}
            inProgress={confirmSubmitting}>
            {subOrderStatus === EVENT_STATUS.JOINED_STATUS
              ? 'Chọn món mới'
              : 'Xác nhận chọn món'}
          </Button>
        </div>
        <div className={css.row}>
          <Button
            className={classNames(css.btn, css.lastBtn)}
            variant="inline"
            type="button"
            onClick={handleReject}
            disabled={disabledRejectButton}
            inProgress={rejectSubmitting}>
            <span>Không tham gia</span>
          </Button>
        </div>
      </div>
    </form>
  );
};

export default DishSelectionForm;
