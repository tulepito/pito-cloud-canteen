/* eslint-disable no-plusplus */
import { InlineTextButton } from '@components/Button/Button';
import FieldCheckbox from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import FieldRadioButton from '@components/FormFields/FieldRadioButton/FieldRadioButton';
import IconAdd from '@components/Icons/IconAdd/IconAdd';
import IconClose from '@components/Icons/IconClose/IconClose';
import { EDayOfWeek } from '@utils/enums';
import {
  composeValidatorsWithAllValues,
  entriesStartAndEndIsDifferent,
  entriesStartAndEndIsDifferentOnEachDayOfWeek,
  maxTimeValidate,
  minTimeValidate,
  nonConflictAvailabilityEntries,
  nonConflictAvailabilityEntriesByDayOfWeek,
  startTimeGreaterThanEndTime,
  startTimeGreaterThanEndTimeOnEachDayOfWeek,
  validAvailabilityPlanEntries,
} from '@utils/validators';
import classNames from 'classnames';
import React from 'react';
import { FieldArray } from 'react-final-form-arrays';
import { FormattedMessage, useIntl } from 'react-intl';

import css from './FieldAvailability.module.scss';
import FieldEntryTime from './FieldEntryTime';

const defaultAvailabilityPlan = (dayOfWeek: string) => {
  return {
    dayOfWeek,
    startTime: '06:30',
    endTime: '23:00',
    seats: 100,
  };
};

export const ALL_WEEK_APPLY = 'allWeekApply';
export const SINGLE_DAY_APPLY = 'singleDayApply';

const isPropValuesEqual = (subject: any, target: any, propNames: string[]) =>
  propNames.every((propName: string) => subject[propName] === target[propName]);

const getUniqueItemsByProperties = (items: any[], propNames: string[]) => {
  const propNamesArray = Array.from(propNames);
  return items.filter(
    (item, index, array) =>
      index ===
      array.findIndex((foundItem) =>
        isPropValuesEqual(foundItem, item, propNamesArray),
      ),
  );
};

const uniqueStringEntries = (array: string[]) => {
  return array.filter((item, pos) => {
    return array.indexOf(item) === pos;
  });
};

const getNewValuesOnDayToApplyChange = ({
  checked,
  dayToApplyValue,
  availabilityPlan,
  daysToApplyName,
  values,
  availabilityName,
}: any) => {
  const allValues = { ...values };
  let newDayToApplyValues = [];
  let newAvailabilityPlan = {};
  const dayToApplyIsAllWeek = dayToApplyValue === ALL_WEEK_APPLY;
  if (checked) {
    // Get unpicked days of week yet
    const remainDays = [] as string[];
    Object.keys(EDayOfWeek).forEach((d: string) => {
      if (!availabilityPlan[d]) {
        remainDays.push(d);
      }
    });
    if (dayToApplyIsAllWeek) {
      newDayToApplyValues = [ALL_WEEK_APPLY];
      // Add default availability to all remaining days of week
      const remainAvailability = remainDays.reduce((prev, cur) => {
        return {
          ...prev,
          [cur]: [defaultAvailabilityPlan(cur)],
        };
      }, {});
      newAvailabilityPlan = {
        ...availabilityPlan,
        ...remainAvailability,
      };
    } else {
      newDayToApplyValues = uniqueStringEntries([
        ...allValues[daysToApplyName],
        dayToApplyValue,
      ]);
      newAvailabilityPlan = {
        ...availabilityPlan,
        [dayToApplyValue]: getUniqueItemsByProperties(
          [
            ...(allValues[availabilityName][dayToApplyValue]
              ? values[availabilityName][dayToApplyValue]
              : []),
            defaultAvailabilityPlan(dayToApplyValue),
          ],
          ['dayOfWeek'],
        ),
      };
    }
  } else if (dayToApplyIsAllWeek) {
    newDayToApplyValues = [...allValues[daysToApplyName]].filter(
      (i: string) => i !== dayToApplyValue,
    );

    Object.keys(EDayOfWeek).forEach((k: any) => {
      delete allValues[availabilityName][k];
    });

    newAvailabilityPlan = allValues[availabilityName];
  } else {
    newDayToApplyValues = [...allValues[daysToApplyName]].filter(
      (i: string) => i !== dayToApplyValue,
    );
    if (allValues[availabilityName][dayToApplyValue]) {
      delete allValues[availabilityName][dayToApplyValue];
    }
    newAvailabilityPlan = allValues[availabilityName];
  }

  const filteredTargetValue = newDayToApplyValues.filter(
    (d: string) => d !== ALL_WEEK_APPLY,
  );
  const shouldClearAllWeeKApply =
    filteredTargetValue.length !== Object.keys(EDayOfWeek).length;

  if (shouldClearAllWeeKApply && dayToApplyValue !== ALL_WEEK_APPLY) {
    let availabilityWithClearedAllWeekApply = {};

    newDayToApplyValues = filteredTargetValue;
    newDayToApplyValues.forEach((d: string) => {
      availabilityWithClearedAllWeekApply = {
        ...availabilityWithClearedAllWeekApply,
        [d]: [defaultAvailabilityPlan(dayToApplyValue)],
      };
    });
    newAvailabilityPlan = availabilityWithClearedAllWeekApply;
  } else {
    newDayToApplyValues = [ALL_WEEK_APPLY];
  }
  return { newAvailabilityPlan, newDayToApplyValues };
};

const HourlyPlan: React.FC<any> = (props) => {
  const { intl, name: fieldName } = props;

  const startTimePlaceholder = intl.formatMessage({
    id: 'FieldAvailability.startTimePlaceholder',
  });
  const endTimePlaceholder = intl.formatMessage({
    id: 'FieldAvailability.endTimePlaceholder',
  });

  return (
    <FieldArray name={fieldName}>
      {({ fields }) => {
        return fields.map((name: any, index: number) => {
          return (
            <tr key={`${fieldName}.${index}`} className={css.dailyPlanWrapper}>
              <td>
                <FieldEntryTime
                  id={`${name}.startTime`}
                  name={`${name}.startTime`}
                  type="time"
                  className={css.fieldSelect}
                  placeholder={startTimePlaceholder}
                  validate={composeValidatorsWithAllValues(
                    nonConflictAvailabilityEntries(
                      intl.formatMessage({
                        id: 'FieldAvailability.conflictEntries',
                      }),
                    ),
                    validAvailabilityPlanEntries(
                      intl.formatMessage({
                        id: 'FieldAvailability.invalidEntries',
                      }),
                    ),
                    entriesStartAndEndIsDifferent(
                      intl.formatMessage({
                        id: 'FieldAvailability.startAndEndTimeIsDifferent',
                      }),
                    ),
                    startTimeGreaterThanEndTime(
                      intl.formatMessage({
                        id: 'FieldAvailability.startAndEndTimeValdid',
                      }),
                    ),
                    minTimeValidate(
                      intl.formatMessage(
                        {
                          id: 'FieldAvailability.minStartTime',
                        },
                        {
                          time: '06:30',
                        },
                      ),
                      '06:30',
                    ),
                    maxTimeValidate(
                      intl.formatMessage(
                        {
                          id: 'FieldAvailability.maxStartTime',
                        },
                        {
                          time: '23:00',
                        },
                      ),
                      '23:00',
                    ),
                  )}
                />
              </td>
              <td>
                <FieldEntryTime
                  id={`${name}.endTime`}
                  className={css.fieldSelect}
                  name={`${name}.endTime`}
                  type="time"
                  placeholder={endTimePlaceholder}
                  validate={composeValidatorsWithAllValues(
                    nonConflictAvailabilityEntries(
                      intl.formatMessage({
                        id: 'FieldAvailability.conflictEntries',
                      }),
                    ),
                    validAvailabilityPlanEntries(
                      intl.formatMessage({
                        id: 'FieldAvailability.invalidEntries',
                      }),
                    ),
                    entriesStartAndEndIsDifferent(
                      intl.formatMessage({
                        id: 'FieldAvailability.startAndEndTimeIsDifferent',
                      }),
                    ),
                    startTimeGreaterThanEndTime(
                      intl.formatMessage({
                        id: 'FieldAvailability.startAndEndTimeValdid',
                      }),
                    ),
                    minTimeValidate(
                      intl.formatMessage(
                        {
                          id: 'FieldAvailability.minEndTime',
                        },
                        {
                          time: "'06:30'",
                        },
                      ),
                      '06:30',
                    ),
                    maxTimeValidate(
                      intl.formatMessage(
                        {
                          id: 'FieldAvailability.maxEndTime',
                        },
                        {
                          time: "'23:00'",
                        },
                      ),
                      '23:00',
                    ),
                  )}
                />
              </td>
              <td>
                <div
                  className={classNames(css.tableActions, {
                    [css.tableActionsFlexEnd]:
                      fields && fields.length && fields.length > 0,
                  })}>
                  {index > 0 && (
                    <InlineTextButton
                      type="button"
                      onClick={() => fields.remove(index)}
                      className={css.addButton}>
                      <IconClose rootClassName={css.iconClose} />
                    </InlineTextButton>
                  )}
                  <InlineTextButton
                    type="button"
                    onClick={() =>
                      fields.push({
                        startTime: null,
                        endTime: null,
                      })
                    }
                    className={css.addButton}>
                    <IconAdd />
                  </InlineTextButton>
                </div>
              </td>
            </tr>
          );
        });
      }}
    </FieldArray>
  );
};

const DailyPlan: React.FC<any> = (props) => {
  const { dayOfWeek, intl, name: fieldName } = props;
  const startTimePlaceholder = intl.formatMessage({
    id: 'FieldAvailability.startTimePlaceholder',
  });
  const endTimePlaceholder = intl.formatMessage({
    id: 'FieldAvailability.endTimePlaceholder',
  });

  return (
    <FieldArray name={`${fieldName}.${dayOfWeek}`}>
      {({ fields }) => {
        return fields.map((name: any, index: number) => {
          return (
            <>
              <tr key={`${name}.${index + 1}`} className={css.dailyPlanWrapper}>
                {index === 0 && (
                  <td rowSpan={Number(fields.length)}>
                    <div className={css.dayOfWeek}>
                      <FormattedMessage
                        id={`FieldAvailability.${dayOfWeek}Label`}
                      />
                    </div>
                  </td>
                )}
                <td>
                  <FieldEntryTime
                    id={`${name}.startTime`}
                    name={`${name}.startTime`}
                    type="time"
                    className={css.fieldSelect}
                    placeholder={startTimePlaceholder}
                    validate={composeValidatorsWithAllValues(
                      nonConflictAvailabilityEntriesByDayOfWeek(
                        intl.formatMessage({
                          id: 'FieldAvailability.conflictEntries',
                        }),
                      ),
                      validAvailabilityPlanEntries(
                        intl.formatMessage({
                          id: 'FieldAvailability.invalidEntries',
                        }),
                      ),
                      entriesStartAndEndIsDifferentOnEachDayOfWeek(
                        intl.formatMessage({
                          id: 'FieldAvailability.startAndEndTimeIsDifferent',
                        }),
                      ),
                      startTimeGreaterThanEndTimeOnEachDayOfWeek(
                        intl.formatMessage({
                          id: 'FieldAvailability.startAndEndTimeValdid',
                        }),
                      ),
                      minTimeValidate(
                        intl.formatMessage(
                          {
                            id: 'FieldAvailability.minStartTime',
                          },
                          {
                            time: '06:30',
                          },
                        ),
                        '06:30',
                      ),
                      maxTimeValidate(
                        intl.formatMessage(
                          {
                            id: 'FieldAvailability.maxStartTime',
                          },
                          {
                            time: '23:00',
                          },
                        ),
                        '23:00',
                      ),
                    )}
                  />
                </td>
                <td>
                  <FieldEntryTime
                    id={`${name}.endTime`}
                    name={`${name}.endTime`}
                    type="time"
                    className={css.fieldSelect}
                    placeholder={endTimePlaceholder}
                    validate={composeValidatorsWithAllValues(
                      nonConflictAvailabilityEntriesByDayOfWeek(
                        intl.formatMessage({
                          id: 'FieldAvailability.conflictEntries',
                        }),
                      ),
                      validAvailabilityPlanEntries(
                        intl.formatMessage({
                          id: 'FieldAvailability.invalidEntries',
                        }),
                      ),
                      entriesStartAndEndIsDifferentOnEachDayOfWeek(
                        intl.formatMessage({
                          id: 'FieldAvailability.startAndEndTimeIsDifferent',
                        }),
                      ),
                      startTimeGreaterThanEndTimeOnEachDayOfWeek(
                        intl.formatMessage({
                          id: 'FieldAvailability.startAndEndTimeValdid',
                        }),
                      ),
                      minTimeValidate(
                        intl.formatMessage(
                          {
                            id: 'FieldAvailability.minEndTime',
                          },
                          {
                            time: '06:30',
                          },
                        ),
                        '06:30',
                      ),
                      maxTimeValidate(
                        intl.formatMessage(
                          {
                            id: 'FieldAvailability.maxEndTime',
                          },
                          {
                            time: '23:00',
                          },
                        ),
                        '23:00',
                      ),
                    )}
                  />
                </td>
                <td>
                  <div
                    className={classNames(css.tableActions, {
                      [css.tableActionsFlexEnd]:
                        fields && fields.length && fields.length > 0,
                    })}>
                    {index > 0 && (
                      <InlineTextButton
                        onClick={() => fields.remove(index)}
                        className={css.addButton}>
                        <IconClose className={css.iconClose} />
                      </InlineTextButton>
                    )}
                    <InlineTextButton
                      onClick={() =>
                        fields.push({
                          dayOfWeek,
                          seets: 100,
                          startTime: null,
                          endTime: null,
                        })
                      }
                      className={css.addButton}>
                      <IconAdd />
                    </InlineTextButton>
                  </div>
                </td>
              </tr>
            </>
          );
        });
      }}
    </FieldArray>
  );
};

const FieldAvailability = (props: any) => {
  const { values, name, className, form } = props;
  const intl = useIntl();
  const daysOfWeek = Object.keys(EDayOfWeek);
  const isAllWeek = values.availabilityApplyType === ALL_WEEK_APPLY;
  const dayToApplys = Object.keys(values[name]);
  const availabilityPlan = values[name];

  const handleOnCheckDayToApply = (e: any) => {
    const { name: daysToApplyName, value: dayToApplyValue, checked } = e.target;
    const { newAvailabilityPlan, newDayToApplyValues } =
      getNewValuesOnDayToApplyChange({
        values,
        daysToApplyName,
        dayToApplyValue,
        availabilityPlan,
        checked,
        availabilityName: name,
      });
    form.change(daysToApplyName, newDayToApplyValues);
    form.change(name, newAvailabilityPlan);
  };

  return (
    <div className={classNames(css.root, className)}>
      <p className={css.fieldLabel}>
        {intl.formatMessage({ id: 'FieldAvailability.label' })}
      </p>
      <div className={css.wrapper}>
        <div className={css.listDay}>
          <p className={css.listDayLabel}>
            {intl.formatMessage({ id: 'FieldAvailability.dateLabel' })}
          </p>
          <div className={css.dayPicker}>
            {daysOfWeek.map((day: string) => {
              return (
                <div
                  key={day}
                  className={classNames(css.dayButton, {
                    [css.active]: values.daysToApply?.includes(day),
                  })}>
                  <FieldCheckbox
                    className={css.checkbox}
                    id={`daysToApply.${day}`}
                    name={'daysToApply'}
                    value={day}
                    customOnChange={handleOnCheckDayToApply}
                  />
                  <label htmlFor={`daysToApply.${day}`} key={day}>
                    {intl.formatMessage({
                      id: `FieldAvailability.${day}Label`,
                    })}
                  </label>
                </div>
              );
            })}
            <div
              className={classNames(css.dayButton, {
                [css.active]: values.daysToApply?.includes(ALL_WEEK_APPLY),
              })}>
              <FieldCheckbox
                className={css.checkbox}
                id={`daysToApply.${ALL_WEEK_APPLY}`}
                name={`daysToApply`}
                value={ALL_WEEK_APPLY}
                customOnChange={handleOnCheckDayToApply}
              />
              <label htmlFor={`daysToApply.${ALL_WEEK_APPLY}`}>
                {intl.formatMessage({
                  id: `FieldAvailability.allWeek`,
                })}
              </label>
            </div>
          </div>
        </div>
        <div className={css.dailyPlanWrapper}>
          <p className={css.listDayLabel}>
            {intl.formatMessage({ id: 'FieldAvailability.dailyPlanLabel' })}
          </p>
          <div className={css.dailyPlanOptionsWrapper}>
            <FieldRadioButton
              name="availabilityApplyType"
              id={ALL_WEEK_APPLY}
              value={ALL_WEEK_APPLY}
              label={intl.formatMessage({
                id: 'FieldAvailability.allWeekApply',
              })}
            />
            {values.availabilityApplyType === ALL_WEEK_APPLY && (
              <div className={css.week}>
                <table className={css.availabilityTable}>
                  <thead>
                    <tr>
                      <td>
                        {intl.formatMessage({
                          id: 'FieldAvailability.from',
                        })}
                      </td>
                      <td>
                        {intl.formatMessage({
                          id: 'FieldAvailability.to',
                        })}
                      </td>
                      <td></td>
                    </tr>
                  </thead>
                  <tbody>
                    <HourlyPlan
                      name="allWeekAvailabilityEntries"
                      values={values}
                      intl={intl}
                      isAllWeek={isAllWeek}
                    />
                  </tbody>
                </table>
              </div>
            )}
            <FieldRadioButton
              name="availabilityApplyType"
              id={SINGLE_DAY_APPLY}
              value={SINGLE_DAY_APPLY}
              label={intl.formatMessage({
                id: 'FieldAvailability.singleDayApply',
              })}
            />
            {values.availabilityApplyType === SINGLE_DAY_APPLY && (
              <div className={css.week}>
                <table className={css.availabilityTable}>
                  <thead>
                    <tr>
                      <td className={css.dayOfWeekLabel}>
                        {intl.formatMessage({
                          id: 'FieldAvailability.dayOfWeek',
                        })}
                      </td>
                      <td>
                        {intl.formatMessage({
                          id: 'FieldAvailability.from',
                        })}
                      </td>
                      <td>
                        {intl.formatMessage({
                          id: 'FieldAvailability.to',
                        })}
                      </td>
                      <td></td>
                    </tr>
                  </thead>
                  <tbody>
                    {dayToApplys.map((w: any) => {
                      return (
                        <DailyPlan
                          name={name}
                          dayOfWeek={w}
                          key={w}
                          values={values}
                          intl={intl}
                          form={form}
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldAvailability;
