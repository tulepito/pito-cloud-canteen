import FieldDatePicker from '@components/FormFields/FieldDatePicker/FieldDatePicker';
import FieldDaysOfWeekCheckboxGroup from '@components/FormFields/FieldDaysOfWeekCheckboxGroup/FieldDaysOfWeekCheckboxGroup';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import { getWeekDayList } from '@utils/dates';
import { EMenuTypes } from '@utils/enums';
import {
  composeValidators,
  nonEmptyArray,
  numberMinLength,
  required,
} from '@utils/validators';
import classNames from 'classnames';
import type { FormApi } from 'final-form';
import React from 'react';
import { useIntl } from 'react-intl';

import css from './FieldMenuApplyTimeGroup.module.scss';

type TFieldMenuApplyTimeGroup = {
  values: any;
  form: FormApi;
  dateInputClassName?: string;
  className?: string;
  inputFieldsClassName?: string;
};

const FieldMenuApplyTimeGroup: React.FC<TFieldMenuApplyTimeGroup> = (props) => {
  const { values, form, dateInputClassName, className, inputFieldsClassName } =
    props;
  const intl = useIntl();
  const setStartDate = (date: Date) => {
    form.change('startDate', date);
    if (values.endDate <= date) {
      form.change('endDate', undefined);
    }
  };

  const setEndDate = (date: Date) => {
    form.change('endDate', date);
  };

  const today = new Date();
  const startDateAsDate = new Date(values.startDate);
  const minEndDate = startDateAsDate.setDate(startDateAsDate.getDate() + 1);
  const daysOfWeek = getWeekDayList(values.startDate, values.endDate);
  return (
    <div className={classNames(css.root, className)}>
      <div className={classNames(css.fields, inputFieldsClassName)}>
        <FieldDatePicker
          id="startDate"
          name="startDate"
          selected={values.startDate}
          onChange={setStartDate}
          minDate={today}
          className={classNames(css.inputDate, dateInputClassName)}
          dateFormat={'dd MMMM, yyyy'}
          placeholderText={'Nhập ngày bắt đầu'}
          autoComplete="off"
          label={intl.formatMessage({
            id: 'EditMenuInformationForm.startDateLabel',
          })}
          validate={required(
            intl.formatMessage({
              id: 'EditMenuInformationForm.startDateRequired',
            }),
          )}
        />
        {values.menuType === EMenuTypes.fixedMenu && (
          <FieldDatePicker
            id="endDate"
            name="endDate"
            selected={values.endDate}
            onChange={setEndDate}
            disabled={!values.startDate}
            minDate={minEndDate || today}
            className={classNames(css.inputDate, dateInputClassName)}
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
          />
        )}
        {values.menuType === EMenuTypes.cycleMenu && (
          <FieldTextInput
            defaultValue="1"
            id="numberOfCycles"
            name="numberOfCycles"
            className={css.numberOfCyclesInput}
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
        disabled={!values.startDate || !values.endDate}
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
