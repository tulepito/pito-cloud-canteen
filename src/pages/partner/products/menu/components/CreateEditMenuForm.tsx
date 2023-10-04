/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/display-name */
import { forwardRef, useEffect, useState } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { OnChange } from 'react-final-form-listeners';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import format from 'date-fns/format';
import viLocale from 'date-fns/locale/vi';
import arrayMutators from 'final-form-arrays';

import Form from '@components/Form/Form';
import FieldCheckboxGroup from '@components/FormFields/FieldCheckboxGroup/FieldCheckboxGroup';
import FieldDatePicker from '@components/FormFields/FieldDatePicker/FieldDatePicker';
import FieldRadioButton from '@components/FormFields/FieldRadioButton/FieldRadioButton';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconCalendar from '@components/Icons/IconCalender/IconCalender';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppDispatch } from '@hooks/reduxHooks';
import { getWeekDayList } from '@src/utils/dates';
import type { EMenuMealType } from '@src/utils/enums';
import { PARTNER_MENU_MEAL_TYPE_OPTIONS } from '@src/utils/enums';
import type { TObject } from '@src/utils/types';
import { composeValidators, maxLength, required } from '@src/utils/validators';

import { prepareFoodListForOrder } from '../helpers/menu.helpers';
import { PartnerManageMenusActions } from '../PartnerManageMenus.slice';

import MealSettings from './MealSettings';
import WeekDays from './WeekDays';

import css from './CreateEditMenuForm.module.scss';

export const MAX_MENU_LENGTH = 200;

const CustomFieldDateInput = forwardRef((props: TObject, ref) => {
  return (
    <FieldTextInput
      {...props}
      name={props.name}
      className={css.customInput}
      format={(value) => {
        return value
          ? format(new Date(value), 'EEE, dd MMMM, yyyy', {
              locale: viLocale,
            })
          : format(new Date(), 'EEE, dd MMMM, yyyy', {
              locale: viLocale,
            });
      }}
      leftIcon={<IconCalendar />}
      inputRef={ref}
    />
  );
});

export type TCreateEditMenuFormValues = {
  menuName: string;
  mealTypes?: EMenuMealType[];
  mealType?: EMenuMealType;
  startDate: number;
  endDate: number;
  foodsByDate: TObject;
};

type TExtraProps = {
  isMealSettingsTab: boolean;
  isDraftEditFlow: boolean;
  mealType: string;
  foodsByDate?: TObject;
  daysOfWeek: string[];
  draftFoodByDate: TObject;
};
type TCreateEditMenuFormComponentProps =
  FormRenderProps<TCreateEditMenuFormValues> & Partial<TExtraProps>;
type TCreateEditMenuFormProps = FormProps<TCreateEditMenuFormValues> &
  TExtraProps;

const CreateEditMenuFormComponent: React.FC<
  TCreateEditMenuFormComponentProps
> = (props) => {
  const {
    handleSubmit,
    form,
    initialValues,
    values,
    mealType,
    isMealSettingsTab,
    isDraftEditFlow = false,
    daysOfWeek = [],
    foodsByDate = {},
    draftFoodByDate = {},
  } = props;
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const { startDate: startDateFromValues, endDate: endDateFromValues } = values;
  const initialStartDate = startDateFromValues
    ? new Date(startDateFromValues)
    : null;
  const initialEndDate = endDateFromValues ? new Date(endDateFromValues) : null;
  const [currentDay, setCurrentDay] = useState(daysOfWeek[0]);
  console.debug(
    '💫 > file: CreateEditMenuForm.tsx:104 > currentDay: ',
    currentDay,
  );
  const [startDate, setStartDate] = useState<Date>(initialStartDate!);
  const [endDate, setEndDate] = useState<Date>(initialEndDate!);

  const startDateClasses = classNames(
    css.customInput,
    !startDate && css.placeholder,
  );

  const endDateClasses = classNames(
    css.customInput,
    !endDate && css.placeholder,
  );

  const foodListByMealAndDay: TObject = prepareFoodListForOrder({
    daysOfWeek,
    mealTypes: values.mealTypes!,
    draftFoodByDate,
    isDraftEditFlow,
    mealType: mealType!,
    foodsByDate,
  });

  const handleStartDateChange = (value: any, prevValue: any) => {
    if (
      endDateFromValues &&
      value !== prevValue &&
      value !== initialValues.startDate
    ) {
      form.batch(() => {
        form.change('endDate', undefined);
        setEndDate(undefined!);
      });
    }
  };

  useEffect(() => {
    dispatch(
      PartnerManageMenusActions.saveDraft({
        ...values,
        ...(startDateFromValues && endDateFromValues
          ? {
              daysOfWeek: getWeekDayList(
                new Date(startDateFromValues),
                new Date(endDateFromValues),
              ),
            }
          : {}),
      }),
    );
    dispatch(PartnerManageMenusActions.clearCreateOrUpdateMenuError());
  }, [JSON.stringify(values)]);

  useEffect(() => {
    setCurrentDay(daysOfWeek[0]);
  }, [JSON.stringify(daysOfWeek)]);
  useEffect(() => {
    setStartDate(initialStartDate!);
  }, [startDateFromValues, JSON.stringify(initialStartDate)]);
  useEffect(() => {
    setEndDate(initialEndDate!);
  }, [endDateFromValues, JSON.stringify(initialEndDate)]);

  return (
    <Form onSubmit={handleSubmit}>
      <div>
        <RenderWhen condition={isMealSettingsTab}>
          <div className={css.container}>
            <div className={css.containerTitle}>Chọn món ăn</div>
            <div className={css.timeRangeContainer}>
              <IconCalendar />
              {startDateFromValues &&
                endDateFromValues &&
                intl.formatDateTimeRange(
                  startDateFromValues,
                  endDateFromValues,
                  { dateStyle: 'long' },
                )}
            </div>

            <WeekDays
              currentDay={currentDay}
              setCurrentDay={setCurrentDay}
              foodListByMealAndDay={foodListByMealAndDay}
              daysOfWeek={daysOfWeek}
            />
          </div>

          <div className={css.mealSettingContainer}>
            <MealSettings
              currentDay={currentDay}
              foodListByMealAndDay={foodListByMealAndDay}
            />
          </div>

          <RenderWhen.False>
            <div className={css.container}>
              <div className={css.containerTitle}>Thông tin menu</div>
              <div className={css.fieldsContainer}>
                <div className={css.fieldContainer}>
                  <label>
                    Tên menu <span>*</span>
                  </label>
                  <FieldTextInput
                    id="CreateEditMenuForm.menuName"
                    name="menuName"
                    placeholder="Nhập tên thực đơn"
                    validate={maxLength(
                      'Vui lòng nhập tên dưới 200 ký tự',
                      MAX_MENU_LENGTH,
                    )}
                  />
                </div>
                <div className={css.fieldContainer}>
                  <label>
                    Bữa phục vụ <span>*</span>
                  </label>

                  <RenderWhen condition={isDraftEditFlow}>
                    <FieldCheckboxGroup
                      name="mealTypes"
                      options={PARTNER_MENU_MEAL_TYPE_OPTIONS}
                    />
                    <RenderWhen.False>
                      {PARTNER_MENU_MEAL_TYPE_OPTIONS.map(({ key, label }) => (
                        <FieldRadioButton
                          key={key}
                          name="mealType"
                          id={`CreateEditMenuForm.mealType.${key}`}
                          value={key}
                          label={label}
                        />
                      ))}
                    </RenderWhen.False>
                  </RenderWhen>
                </div>
              </div>
            </div>
            <div className={css.container}>
              <div className={css.containerTitle}>
                Thời gian áp dụng <span>*</span>
              </div>

              <OnChange name="startDate">{handleStartDateChange}</OnChange>

              <div className={css.fieldContainer}>
                <FieldDatePicker
                  id="startDate"
                  name="startDate"
                  selected={startDate}
                  onChange={(date: Date) => setStartDate(date)}
                  minDate={new Date()}
                  autoComplete="off"
                  label={'Ngày bắt đầu'}
                  dateFormat={'EEE, dd MMMM, yyyy'}
                  className={startDateClasses}
                  placeholderText={format(new Date(), 'EEE, dd MMMM, yyyy', {
                    locale: viLocale,
                  })}
                  validate={composeValidators(
                    required('Vui lòng chọn ngày bắt đầu'),
                  )}
                  customInput={<CustomFieldDateInput />}
                />
              </div>
              <div className={css.fieldContainer}>
                <FieldDatePicker
                  id="endDate"
                  name="endDate"
                  onChange={(date: Date) => setEndDate(date)}
                  selected={endDate}
                  label={'Ngày kết thúc'}
                  className={endDateClasses}
                  minDate={startDate}
                  dateFormat={'EEE, dd MMMM, yyyy'}
                  autoComplete="off"
                  validate={required('Vui lòng chọn ngày kết thúc')}
                  disabled={!startDate}
                  placeholderText={format(new Date(), 'EEE, dd MMMM, yyyy', {
                    locale: viLocale,
                  })}
                  customInput={<CustomFieldDateInput />}
                />
              </div>
            </div>
          </RenderWhen.False>
        </RenderWhen>
      </div>
    </Form>
  );
};

const CreateEditMenuForm: React.FC<TCreateEditMenuFormProps> = (props) => {
  return (
    <FinalForm
      mutators={{ ...arrayMutators }}
      {...props}
      component={CreateEditMenuFormComponent}
    />
  );
};

export default CreateEditMenuForm;
