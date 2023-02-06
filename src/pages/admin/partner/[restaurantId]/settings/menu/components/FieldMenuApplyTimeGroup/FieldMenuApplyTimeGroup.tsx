import FieldDatePicker from '@components/FormFields/FieldDatePicker/FieldDatePicker';
import FieldDaysOfWeekCheckboxGroup from '@components/FormFields/FieldDaysOfWeekCheckboxGroup/FieldDaysOfWeekCheckboxGroup';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import { EMenuTypes } from '@utils/enums';
import {
  composeValidators,
  nonEmptyArray,
  numberMinLength,
  required,
} from '@utils/validators';
import type { FormApi } from 'final-form';
import React from 'react';
import { useIntl } from 'react-intl';

import css from './FieldMenuApplyTimeGroup.module.scss';

type TFieldMenuApplyTimeGroup = {
  values: any;
  form: FormApi;
};

const FieldMenuApplyTimeGroup: React.FC<TFieldMenuApplyTimeGroup> = (props) => {
  const { values, form } = props;
  const intl = useIntl();
  const setStartDate = (date: Date) => {
    form.change('startDate', date);
  };

  const today = new Date();

  return (
    <div>
      <div className={css.fields}>
        <FieldDatePicker
          id="startDate"
          name="startDate"
          selected={values.startDate}
          onChange={setStartDate}
          minDate={today}
          className={css.inputDate}
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
        {values.menuType === EMenuTypes.cycleMenu && (
          <FieldTextInput
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
                0,
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
