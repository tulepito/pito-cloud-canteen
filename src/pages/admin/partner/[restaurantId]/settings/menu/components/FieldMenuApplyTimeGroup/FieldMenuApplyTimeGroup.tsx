import React, { useState } from 'react';
import { OnChange } from 'react-final-form-listeners';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import format from 'date-fns/format';
import viLocale from 'date-fns/locale/vi';
import type { FormApi } from 'final-form';

import FieldDatePicker from '@components/FormFields/FieldDatePicker/FieldDatePicker';
import FieldDaysOfWeekCheckboxGroup from '@components/FormFields/FieldDaysOfWeekCheckboxGroup/FieldDaysOfWeekCheckboxGroup';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import { getWeekDayList } from '@utils/dates';
import { EDayOfWeek, EMenuType } from '@utils/enums';
import {
  composeValidators,
  nonEmptyArray,
  numberMinLength,
  required,
} from '@utils/validators';

import css from './FieldMenuApplyTimeGroup.module.scss';

type TFieldMenuApplyTimeGroup = {
  values: any;
  form: FormApi;
  dateInputClassName?: string;
  className?: string;
  inputFieldsClassName?: string;
  isReadOnly?: boolean;
};

const FieldMenuApplyTimeGroup: React.FC<TFieldMenuApplyTimeGroup> = (props) => {
  const {
    values,
    form,
    dateInputClassName,
    className,
    inputFieldsClassName,
    isReadOnly,
  } = props;
  const intl = useIntl();
  const { startDate: startDateInitialValue, endDate: endDateInitialValue } =
    values;
  const initialStartDate = startDateInitialValue
    ? new Date(startDateInitialValue)
    : null;
  const initialEndDate = endDateInitialValue
    ? new Date(endDateInitialValue)
    : null;
  const [startDate, setStartDate] = useState<Date>(initialStartDate!);
  const [endDate, setEndDate] = useState<Date>(initialEndDate!);

  const isCycleMenu = values.menuType === EMenuType.cycleMenu;

  const today = new Date();
  const startDateAsDate = new Date(values.startDate);
  const minEndDate = startDateAsDate.setDate(startDateAsDate.getDate() + 1);
  const daysOfWeek = isCycleMenu
    ? Object.keys(EDayOfWeek).map(
        (k) => EDayOfWeek[k as keyof typeof EDayOfWeek],
      )
    : getWeekDayList(values.startDate, values.endDate);

  const disabledDaysOfWeek = isCycleMenu
    ? false
    : !values.startDate || !values.endDate;

  const startDateClasses = classNames(
    css.inputDate,
    dateInputClassName,
    !startDate && css.placeholder,
  );

  const endDateClasses = classNames(
    css.inputDate,
    dateInputClassName,
    !endDate && css.placeholder,
  );

  const handleStartDateChange = (value: any, prevValue: any) => {
    if (endDateInitialValue && value !== prevValue) {
      form.batch(() => {
        form.change('endDate', undefined);
        setEndDate(undefined!);
      });
    }
  };

  return (
    <div className={classNames(css.root, className)}>
      <div className={classNames(css.fields, inputFieldsClassName)}>
        <OnChange name="startDate">{handleStartDateChange}</OnChange>
        <FieldDatePicker
          id="startDate"
          name="startDate"
          selected={startDate}
          onChange={(date: Date) => setStartDate(date)}
          disabled={isReadOnly}
          readOnly={isReadOnly}
          minDate={today}
          className={startDateClasses}
          dateFormat={'EEE, dd MMMM, yyyy'}
          placeholderText={format(new Date(), 'EEE, dd MMMM, yyyy', {
            locale: viLocale,
          })}
          position="bottom"
          autoComplete="off"
          label={intl.formatMessage({
            id: 'EditMenuInformationForm.startDateLabel',
          })}
          validate={required(
            intl.formatMessage({
              id: 'EditMenuInformationForm.startDateRequired',
            }),
          )}
          shouldSkipTouched={false}
        />
        {values.menuType === EMenuType.fixedMenu && (
          <FieldDatePicker
            id="endDate"
            name="endDate"
            selected={values.endDate}
            onChange={(date: Date) => setEndDate(date)}
            disabled={isReadOnly || !values.startDate}
            readOnly={isReadOnly}
            minDate={minEndDate || today}
            className={endDateClasses}
            dateFormat={'dd MMMM, yyyy'}
            placeholderText={'Nhập ngày kết thúc'}
            autoComplete="off"
            label={intl.formatMessage({
              id: 'EditMenuInformationForm.endDateLabel',
            })}
            validate={required(
              intl.formatMessage({
                id: 'EditMenuInformationForm.endDateRequired',
              }),
            )}
            shouldSkipTouched={false}
          />
        )}
        {isCycleMenu && (
          <FieldTextInput
            defaultValue="1"
            id="numberOfCycles"
            name="numberOfCycles"
            className={css.numberOfCyclesInput}
            disabled={isReadOnly}
            placeholder={intl.formatMessage({
              id: 'EditMenuInformationForm.numberOfCyclesPlaceholder',
            })}
            label={intl.formatMessage({
              id: 'EditMenuInformationForm.numberOfCyclesLabel',
            })}
            rightIcon={
              <div className={css.weekSuffixed}>
                {intl.formatMessage({
                  id: 'EditMenuInformationForm.week',
                })}
              </div>
            }
            rightIconContainerClassName={css.inputSuffixedContainer}
            validate={composeValidators(
              numberMinLength(
                intl.formatMessage({
                  id: 'EditMenuInformationForm.numberOfCyclesMinLength',
                }),
                1,
              ),
              required(
                intl.formatMessage({
                  id: 'EditMenuInformationForm.numberOfCyclesRequired',
                }),
              ),
            )}
          />
        )}
      </div>
      <FieldDaysOfWeekCheckboxGroup
        disabled={isReadOnly || disabledDaysOfWeek}
        daysOfWeek={daysOfWeek}
        label={intl.formatMessage({
          id: 'EditMenuInformationForm.daysOfWeekLabel',
        })}
        values={values}
        name="daysOfWeek"
        validate={nonEmptyArray(
          intl.formatMessage({
            id: 'EditMenuInformationForm.daysOfWeekRequired',
          }),
        )}
      />
    </div>
  );
};

export default FieldMenuApplyTimeGroup;
