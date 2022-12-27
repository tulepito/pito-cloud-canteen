import { InlineTextButton } from '@components/Button/Button';
import FieldCheckbox from '@components/FieldCheckbox/FieldCheckbox';
import FieldRadioButton from '@components/FieldRadioButton/FieldRadioButton';
import FieldSelect from '@components/FieldSelect/FieldSelect';
import IconAdd from '@components/IconAdd/IconAdd';
import IconClose from '@components/IconClose/IconClose';
import { EDayOfWeek } from '@utils/enums';
import classNames from 'classnames';
import React from 'react';
import { FieldArray } from 'react-final-form-arrays';
import { FormattedMessage, useIntl } from 'react-intl';

import css from './FieldAvailability.module.scss';

const printHourStrings = (h: any) => {
  return h > 9 ? `${h}:00` : `0${h}:00`;
};

const TIMES = Array(24 * 2).fill(1);

const getAllStartTimes = () => {
  const x = 30; // minutes interval
  const times: any[] = []; // time array
  let tt = 0; // start time

  // loop to increment the time and push results in array
  TIMES.forEach((_value: any, index: number) => {
    const hh = Math.floor(tt / 60); // getting hours of day in 0-24 format
    const mm = tt % 60; // getting minutes of the hour in 0-55 format
    times[index] = `${`0${hh}`.slice(-2)}:${`0${mm}`.slice(-2)}`; // pushing data in array in [00:00 - 12:00 AM/PM format]
    tt += x;
  });

  return times;
};

const getAllEndTimes = () => {
  const x = 30; // minutes interval
  const times: any[] = []; // time array
  let tt = 30; // start time
  // loop to increment the time and push results in array
  TIMES.forEach((_value: any, index: number) => {
    const hh = Math.floor(tt / 60); // getting hours of day in 0-24 format
    const mm = tt % 60; // getting minutes of the hour in 0-55 format
    times[index] = `${`0${hh}`.slice(-2)}:${`0${mm}`.slice(-2)}`; // pushing data in array in [00:00 - 12:00 AM/PM format]
    tt += x;
  });

  return times;
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
  return array.filter(function (item, pos) {
    return array.indexOf(item) === pos;
  });
};

const sortEntries =
  (defaultCompareReturn = 0) =>
  (a: any, b: any) => {
    if (a.startTime && b.startTime) {
      const aStart = Number.parseInt(a.startTime.split(':')[0], 10);
      const bStart = Number.parseInt(b.startTime.split(':')[0], 10);
      return aStart - bStart;
    }
    return defaultCompareReturn;
  };

const findEntryFn = (entry: any) => (e: any) =>
  e.startTime === entry.startTime && e.endTime === entry.endTime;

const filterStartHours = (
  availableStartHours: any,
  values: any,
  name: string,
  dayOfWeek: any,
  index: any,
) => {
  const entries = values[name][dayOfWeek];
  const currentEntry = entries[index];

  // If there is no end time selected, return all the available start times
  if (!currentEntry.endTime) {
    return availableStartHours;
  }

  // By default the entries are not in order so we need to sort the entries by startTime
  // in order to find out the previous entry
  const sortedEntries = [...entries].sort(sortEntries());

  // Find the index of the current entry from sorted entries
  const currentIndex = sortedEntries.findIndex(findEntryFn(currentEntry));

  // If there is no next entry or the previous entry does not have endTime,
  // return all the available times before current selected end time.
  // Otherwise return all the available start times that are after the previous entry or entries.
  const prevEntry = sortedEntries[currentIndex - 1];
  const pickBefore = (time: any) => (h: any) => h < time;
  const pickBetween = (start: any, end: any) => (h: any) =>
    h >= start && h < end;

  return !prevEntry || !prevEntry.endTime
    ? availableStartHours.filter(pickBefore(currentEntry.endTime))
    : availableStartHours.filter(
        pickBetween(prevEntry.endTime, currentEntry.endTime),
      );
};

const filterStartAllWeekHours = (
  availableStartHours: any,
  values: any,
  name: string,
  index: any,
) => {
  const entries = values[name];
  const currentEntry = entries[index];

  // If there is no end time selected, return all the available start times
  if (!currentEntry.endTime) {
    return availableStartHours;
  }

  // By default the entries are not in order so we need to sort the entries by startTime
  // in order to find out the previous entry
  const sortedEntries = [...entries].sort(sortEntries());

  // Find the index of the current entry from sorted entries
  const currentIndex = sortedEntries.findIndex(findEntryFn(currentEntry));

  // If there is no next entry or the previous entry does not have endTime,
  // return all the available times before current selected end time.
  // Otherwise return all the available start times that are after the previous entry or entries.
  const prevEntry = sortedEntries[currentIndex - 1];
  const pickBefore = (time: any) => (h: any) => h < time;
  const pickBetween = (start: any, end: any) => (h: any) =>
    h >= start && h < end;

  return !prevEntry || !prevEntry.endTime
    ? availableStartHours.filter(pickBefore(currentEntry.endTime))
    : availableStartHours.filter(
        pickBetween(prevEntry.endTime, currentEntry.endTime),
      );
};

const filterEndAllWeekHours = (
  availableEndHours: any,
  values: any,
  name: string,
  index: any,
) => {
  const entries = values[name];
  const currentEntry = entries[index];

  // If there is no start time selected, return an empty array;
  if (!currentEntry.startTime) {
    return [];
  }

  // By default the entries are not in order so we need to sort the entries by startTime
  // in order to find out the allowed start times
  const sortedEntries = [...entries].sort(sortEntries(-1));

  // Find the index of the current entry from sorted entries
  const currentIndex = sortedEntries.findIndex(findEntryFn(currentEntry));

  // If there is no next entry,
  // return all the available end times that are after the start of current entry.
  // Otherwise return all the available end hours between current start time and next entry.
  const nextEntry = sortedEntries[currentIndex + 1];
  const pickAfter = (time: any) => (h: any) => h > time;
  const pickBetween = (start: any, end: any) => (h: any) =>
    h > start && h <= end;

  return !nextEntry || !nextEntry.startTime
    ? availableEndHours.filter(pickAfter(currentEntry.startTime))
    : availableEndHours.filter(
        pickBetween(currentEntry.startTime, nextEntry.startTime),
      );
};

const filterEndHours = (
  availableEndHours: any,
  values: any,
  name: string,
  dayOfWeek: any,
  index: any,
) => {
  const entries = values[name][dayOfWeek];
  const currentEntry = entries[index];

  // If there is no start time selected, return an empty array;
  if (!currentEntry.startTime) {
    return [];
  }

  // By default the entries are not in order so we need to sort the entries by startTime
  // in order to find out the allowed start times
  const sortedEntries = [...entries].sort(sortEntries(-1));

  // Find the index of the current entry from sorted entries
  const currentIndex = sortedEntries.findIndex(findEntryFn(currentEntry));

  // If there is no next entry,
  // return all the available end times that are after the start of current entry.
  // Otherwise return all the available end hours between current start time and next entry.
  const nextEntry = sortedEntries[currentIndex + 1];
  const pickAfter = (time: any) => (h: any) => h > time;
  const pickBetween = (start: any, end: any) => (h: any) =>
    h > start && h <= end;

  return !nextEntry || !nextEntry.startTime
    ? availableEndHours.filter(pickAfter(currentEntry.startTime))
    : availableEndHours.filter(
        pickBetween(currentEntry.startTime, nextEntry.startTime),
      );
};

const getEntryBoundaries =
  (values: any, name: string, dayOfWeek: any, intl: any, findStartHours: any) =>
  (index: any) => {
    const entries = values[name][dayOfWeek];
    const boundaryDiff = findStartHours ? 0 : 1;
    return entries.reduce((allHours: any, entry: any, i: any) => {
      const { startTime, endTime } = entry || {};
      if (i !== index && startTime && endTime) {
        const startHour = Number.parseInt(startTime.split(':')[0], 10);
        const endHour = Number.parseInt(endTime.split(':')[0], 10);
        const hoursBetween = Array(endHour - startHour)
          .fill(1)
          .map((v: any, newI: any) =>
            printHourStrings(startHour + newI + boundaryDiff),
          );
        return allHours.concat(hoursBetween);
      }

      return allHours;
    }, []);
  };

const getEntryWeeklyBoundaries =
  (values: any, name: string, intl: any, findStartHours: any) =>
  (index: any) => {
    const entries = values[name];
    const boundaryDiff = findStartHours ? 0 : 1;
    return entries.reduce((allHours: any, entry: any, i: any) => {
      const { startTime, endTime } = entry || {};
      if (i !== index && startTime && endTime) {
        const startHour = Number.parseInt(startTime.split(':')[0], 10);
        const endHour = Number.parseInt(endTime.split(':')[0], 10);
        const hoursBetween = Array(endHour - startHour)
          .fill(1)
          .map((v: any, newI: any) =>
            printHourStrings(startHour + newI + boundaryDiff),
          );
        return allHours.concat(hoursBetween);
      }

      return allHours;
    }, []);
  };

const HourlyPlan: React.FC<any> = (props) => {
  const { values, intl, name: fieldName } = props;
  const startTimePlaceholder = intl.formatMessage({
    id: 'FieldAvailability.startTimePlaceholder',
  });
  const endTimePlaceholder = intl.formatMessage({
    id: 'FieldAvailability.endTimePlaceholder',
  });

  const getEntryStartTimes = getEntryWeeklyBoundaries(
    values,
    fieldName,
    intl,
    true,
  );
  const getEntryEndTimes = getEntryWeeklyBoundaries(
    values,
    fieldName,
    intl,
    false,
  );
  return (
    <FieldArray name={fieldName}>
      {({ fields }) => {
        return fields.map((name: any, index: number) => {
          // Pick available start hours
          const pickUnreservedStartHours = (h: any) =>
            !getEntryStartTimes(index).includes(h);
          const availableStartHours = getAllStartTimes().filter(
            pickUnreservedStartHours,
          );

          // Pick available end hours
          const pickUnreservedEndHours = (h: any) =>
            !getEntryEndTimes(index).includes(h);
          const availableEndHours = getAllEndTimes().filter(
            pickUnreservedEndHours,
          );

          return (
            <tr key={`${fieldName}.${index}`} className={css.dailyPlanWrapper}>
              <td>
                <FieldSelect
                  id={`${name}.startTime`}
                  name={`${name}.startTime`}
                  selectClassName={css.fieldSelect}>
                  <option disabled value="">
                    {startTimePlaceholder}
                  </option>
                  {filterStartAllWeekHours(
                    availableStartHours,
                    values,
                    fieldName,
                    index,
                  ).map((s: any) => (
                    <option value={s} key={s}>
                      {s}
                    </option>
                  ))}
                </FieldSelect>
              </td>
              <td>
                <FieldSelect
                  id={`${name}.endTime`}
                  name={`${name}.endTime`}
                  selectClassName={css.fieldSelect}>
                  <option disabled value="">
                    {endTimePlaceholder}
                  </option>
                  {filterEndAllWeekHours(
                    availableEndHours,
                    values,
                    fieldName,
                    index,
                  ).map((s: any) => (
                    <option value={s} key={s}>
                      {s}
                    </option>
                  ))}
                </FieldSelect>
              </td>
              <td
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
                      startTime: null,
                      endTime: null,
                    })
                  }
                  className={css.addButton}>
                  <IconAdd />
                </InlineTextButton>
              </td>
            </tr>
          );
        });
      }}
    </FieldArray>
  );
};

const DailyPlan: React.FC<any> = (props) => {
  const { dayOfWeek, values, intl, name: fieldName } = props;
  const getEntryStartTimes = getEntryBoundaries(
    values,
    fieldName,
    dayOfWeek,
    intl,
    true,
  );
  const getEntryEndTimes = getEntryBoundaries(
    values,
    fieldName,
    dayOfWeek,
    intl,
    false,
  );
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
          // Pick available start hours
          const pickUnreservedStartHours = (h: any) =>
            !getEntryStartTimes(index).includes(h);
          const availableStartHours = getAllStartTimes().filter(
            pickUnreservedStartHours,
          );
          // Pick available end hours
          const pickUnreservedEndHours = (h: any) =>
            !getEntryEndTimes(index).includes(h);
          const availableEndHours = getAllEndTimes().filter(
            pickUnreservedEndHours,
          );
          return (
            <tr key={`${name}.${index}`} className={css.dailyPlanWrapper}>
              {index === 0 && (
                <td rowSpan={fields.length}>
                  <div className={css.dayOfWeek}>
                    <FormattedMessage
                      id={`FieldAvailability.${dayOfWeek}Label`}
                    />
                  </div>
                </td>
              )}
              <td>
                <FieldSelect
                  id={`${name}.startTime`}
                  name={`${name}.startTime`}
                  selectClassName={css.fieldSelect}>
                  <option disabled value="">
                    {startTimePlaceholder}
                  </option>
                  {filterStartHours(
                    availableStartHours,
                    values,
                    fieldName,
                    dayOfWeek,
                    index,
                  ).map((s: any) => (
                    <option value={s} key={s}>
                      {s}
                    </option>
                  ))}
                </FieldSelect>
              </td>
              <td>
                <FieldSelect
                  key={name}
                  id={`${name}.endTime`}
                  name={`${name}.endTime`}
                  selectClassName={css.fieldSelect}>
                  <option disabled value="">
                    {endTimePlaceholder}
                  </option>
                  {filterEndHours(
                    availableEndHours,
                    values,
                    fieldName,
                    dayOfWeek,
                    index,
                  ).map((s: any) => (
                    <option value={s} key={s}>
                      {s}
                    </option>
                  ))}
                </FieldSelect>
              </td>
              <td
                className={classNames(css.tableActions, {
                  [css.tableActionsFlexEnd]:
                    fields && fields.length && fields.length > 0,
                })}>
                {index > 0 && (
                  <InlineTextButton
                    key={name}
                    onClick={() => fields.remove(index)}
                    className={css.addButton}>
                    <IconClose className={css.iconClose} />
                  </InlineTextButton>
                )}
                <InlineTextButton
                  key={name}
                  onClick={() =>
                    fields.push({
                      dayOfWeek,
                      seets: 1,
                      startTime: null,
                      endTime: null,
                    })
                  }
                  className={css.addButton}>
                  <IconAdd />
                </InlineTextButton>
              </td>
            </tr>
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

  const handleOnCheckDay = (e: any) => {
    const { name: targetName, value, checked } = e.target;
    let newTargetValues = [];
    let newAvailabilityPlan = {};
    const valueIsAllWeek = value === ALL_WEEK_APPLY;
    if (checked) {
      if (valueIsAllWeek) {
        newTargetValues = [ALL_WEEK_APPLY];
        const remainDays = [] as string[];
        Object.keys(EDayOfWeek).forEach((d: string) => {
          if (!availabilityPlan[d]) {
            remainDays.push(d);
          }
        });
        const remainAvailability = remainDays.reduce((prev, cur) => {
          return {
            ...prev,
            [cur]: [
              {
                dayOfWeek: cur,
                startTime: '00:00',
                endTime: '23:00',
                seats: 1,
              },
            ],
          };
        }, {});
        newAvailabilityPlan = {
          ...availabilityPlan,
          ...remainAvailability,
        };
      } else {
        const remainDays = [] as string[];
        Object.keys(EDayOfWeek).forEach((d: string) => {
          if (!availabilityPlan[d]) {
            remainDays.push(d);
          }
        });
        newTargetValues = uniqueStringEntries([...values[targetName], value]);
        newAvailabilityPlan = {
          ...availabilityPlan,
          [value]: getUniqueItemsByProperties(
            [
              ...(values[name][value] ? values[name][value] : []),
              {
                dayOfWeek: value,
                startTime: '00:00',
                endTime: '23:00',
                seats: 1,
              },
            ],
            ['dayOfWeek'],
          ),
        };
      }
    } else if (valueIsAllWeek) {
      newTargetValues = [...values[targetName]].filter(
        (i: string) => i !== value,
      );

      Object.keys(EDayOfWeek).forEach((k: any) => {
        delete values[name][k];
      });

      newAvailabilityPlan = values[name];
    } else {
      newTargetValues = [...values[targetName]].filter(
        (i: string) => i !== value,
      );

      if (values[name][value]) {
        delete values[name][value];
      }
      newAvailabilityPlan = values[name];
    }

    const filteredTargetValue = newTargetValues.filter(
      (d: string) => d !== ALL_WEEK_APPLY,
    );
    const shouldClearAllWeeKApply =
      filteredTargetValue.length !== Object.keys(EDayOfWeek).length;

    if (shouldClearAllWeeKApply && value !== ALL_WEEK_APPLY) {
      newTargetValues = filteredTargetValue;
      let availabilityWithClearedAllWeekApply = {};
      newTargetValues.forEach((d: string) => {
        availabilityWithClearedAllWeekApply = {
          ...availabilityWithClearedAllWeekApply,
          [d]: [
            {
              dayOfWeek: value,
              startTime: '00:00',
              endTime: '23:00',
              seats: 1,
            },
          ],
        };
      });
      newAvailabilityPlan = availabilityWithClearedAllWeekApply;
    } else {
      newTargetValues = [ALL_WEEK_APPLY];
    }
    form.change(targetName, newTargetValues);
    form.change(name, newAvailabilityPlan);
  };

  return (
    <div className={classNames(css.root, className)}>
      <p>{intl.formatMessage({ id: 'FieldAvailability.label' })}</p>
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
                    customOnChange={handleOnCheckDay}
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
                customOnChange={handleOnCheckDay}
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
