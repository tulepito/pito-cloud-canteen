import { InlineTextButton } from '@components/Button/Button';
import FieldCheckbox from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import FieldRadioButton from '@components/FormFields/FieldRadioButton/FieldRadioButton';
import FieldSelect from '@components/FormFields/FieldSelect/FieldSelect';
import IconAdd from '@components/Icons/IconAdd/IconAdd';
import IconClose from '@components/Icons/IconClose/IconClose';
import { EDayOfWeek } from '@utils/enums';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import memoize from 'lodash/memoize';
import React from 'react';
import { FieldArray } from 'react-final-form-arrays';
import { FormattedMessage, useIntl } from 'react-intl';

import css from './FieldAvailability.module.scss';

const printHourStrings = memoize((i: number) => {
  const h = Math.floor(i / 2);
  const m = i % 2;
  const hMaybe = h > 9 ? h.toString() : `0${h}`;
  const mMaybe = m === 0 ? '00' : '30';

  return `${hMaybe}:${mMaybe}`;
});

const HOURS = Array(48).fill(1);
const ALL_START_HOURS = [...HOURS].map((v, i) => printHourStrings(i));
const ALL_END_HOURS = [...HOURS].map((v, i) => printHourStrings(i + 1));

const timeToValue = memoize((t: any) => {
  if (t) {
    const [h, m] = t.split(':');
    return parseInt(h, 10) * 2 + (parseInt(m, 10) === 30 ? 1 : 0);
  }
  return 0;
});

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

const sortEntries =
  (defaultCompareReturn = 0) =>
  (a: any, b: any) => {
    if (a.startTime && b.startTime) {
      const aStart = timeToValue(a.startTime);
      const bStart = timeToValue(b.startTime);
      return aStart - bStart;
    }
    return defaultCompareReturn;
  };

const findEntryFn = (entry: any) => (e: any) =>
  e.startTime === entry.startTime && e.endTime === entry.endTime;

const filterStartHours = (
  availableStartHours: any[],
  values: any,
  fieldName: string,
  dayOfWeek: string,
  index: number,
) => {
  if (isEmpty(values[fieldName])) return [];
  const entries = values[fieldName][dayOfWeek];
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
  const pickBefore = (time: any) => (h: any) =>
    timeToValue(h) < timeToValue(time);
  const pickBetween = (start: any, end: any) => (h: any) =>
    timeToValue(h) >= timeToValue(start) && timeToValue(h) < timeToValue(end);

  return !prevEntry || !prevEntry.endTime
    ? availableStartHours.filter(pickBefore(currentEntry.endTime))
    : availableStartHours.filter(
        pickBetween(prevEntry.endTime, currentEntry.endTime),
      );
};

const filterEndHours = (
  availableEndHours: any,
  values: any,
  fieldName: string,
  dayOfWeek: any,
  index: any,
) => {
  if (isEmpty(values)) return [];
  const entries = values[fieldName][dayOfWeek];
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
  const pickAfter = (time: any) => (h: any) =>
    timeToValue(h) > timeToValue(time);
  const pickBetween = (start: any, end: any) => (h: any) =>
    timeToValue(h) > timeToValue(start) && timeToValue(h) <= timeToValue(end);

  return !nextEntry || !nextEntry.startTime
    ? availableEndHours.filter(pickAfter(currentEntry.startTime))
    : availableEndHours.filter(
        pickBetween(currentEntry.startTime, nextEntry.startTime),
      );
};

const getEntryBoundaries =
  (
    values: any,
    fieldName: string,
    dayOfWeek: string,
    intl: any,
    findStartHours: any,
  ) =>
  (index: any) => {
    if (isEmpty(values)) return [];
    const entries = values[fieldName][dayOfWeek];
    const boundaryDiff = findStartHours ? 0 : 1;

    return entries.reduce((allHours: any, entry: any, i: any) => {
      const { startTime, endTime } = entry || {};

      if (i !== index && startTime && endTime) {
        const startHour = timeToValue(startTime);
        const endHour = timeToValue(endTime);
        const hoursBetween = Array(endHour - startHour)
          .fill(1)
          // eslint-disable-next-line @typescript-eslint/no-shadow
          .map((v, index: number) =>
            printHourStrings(startHour + index + boundaryDiff),
          );

        return allHours.concat(hoursBetween);
      }

      return allHours;
    }, []);
  };

const filterStartAllWeekHours = (
  availableStartHours: any,
  values: any,
  name: string,
  index: any,
) => {
  if (isEmpty(values[name])) return [];
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
  const pickBefore = (time: any) => (h: any) =>
    timeToValue(h) < timeToValue(time);
  const pickBetween = (start: any, end: any) => (h: any) =>
    timeToValue(h) >= timeToValue(start) && timeToValue(h) < timeToValue(end);

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
  if (isEmpty(values)) return [];
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
  const pickAfter = (time: any) => (h: any) =>
    timeToValue(h) > timeToValue(time);

  const pickBetween = (start: any, end: any) => (h: any) =>
    timeToValue(h) > timeToValue(start) && timeToValue(h) <= timeToValue(end);

  return !nextEntry || !nextEntry.startTime
    ? availableEndHours.filter(pickAfter(currentEntry.startTime))
    : availableEndHours.filter(
        pickBetween(currentEntry.startTime, nextEntry.startTime),
      );
};

const getEntryWeeklyBoundaries =
  (values: any, name: string, intl: any, findStartHours: any) =>
  (index: any) => {
    if (isEmpty(values)) return [];
    const entries = values[name];
    const boundaryDiff = findStartHours ? 0 : 1;

    return entries.reduce((allHours: any, entry: any, i: any) => {
      const { startTime, endTime } = entry || {};

      if (i !== index && startTime && endTime) {
        const startHour = timeToValue(startTime);
        const endHour = timeToValue(endTime);
        const hoursBetween = Array(endHour - startHour)
          .fill(1)
          // eslint-disable-next-line @typescript-eslint/no-shadow
          .map((v, index: number) =>
            printHourStrings(startHour + index + boundaryDiff),
          );

        return allHours.concat(hoursBetween);
      }

      return allHours;
    }, []);
  };

const handleDayToApplyChange = ({
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
  const valueIsAllWeek = dayToApplyValue === ALL_WEEK_APPLY;
  if (checked) {
    if (valueIsAllWeek) {
      newDayToApplyValues = [ALL_WEEK_APPLY];
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
            {
              dayOfWeek: dayToApplyValue,
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
    newDayToApplyValues = filteredTargetValue;
    let availabilityWithClearedAllWeekApply = {};
    newDayToApplyValues.forEach((d: string) => {
      availabilityWithClearedAllWeekApply = {
        ...availabilityWithClearedAllWeekApply,
        [d]: [
          {
            dayOfWeek: dayToApplyValue,
            startTime: '00:00',
            endTime: '23:00',
            seats: 1,
          },
        ],
      };
    });
    newAvailabilityPlan = availabilityWithClearedAllWeekApply;
  } else {
    newDayToApplyValues = [ALL_WEEK_APPLY];
  }
  return { newAvailabilityPlan, newDayToApplyValues };
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

          const availableStartHours = ALL_START_HOURS.filter(
            pickUnreservedStartHours,
          );

          // Pick available end hours
          const pickUnreservedEndHours = (h: any) =>
            !getEntryEndTimes(index).includes(h);

          const availableEndHours = ALL_END_HOURS.filter(
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
                    type="button"
                    onClick={() => fields.remove(index)}
                    className={css.addButton}>
                    <IconClose className={css.iconClose} />
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

          const availableStartHours = ALL_START_HOURS.filter(
            pickUnreservedStartHours,
          );

          // Pick available end hours
          const pickUnreservedEndHours = (h: any) =>
            !getEntryEndTimes(index).includes(h);

          const availableEndHours = ALL_END_HOURS.filter(
            pickUnreservedEndHours,
          );
          return (
            <tr key={`${name}.${index + 1}`} className={css.dailyPlanWrapper}>
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
                    onClick={() => fields.remove(index)}
                    className={css.addButton}>
                    <IconClose className={css.iconClose} />
                  </InlineTextButton>
                )}
                <InlineTextButton
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
    const { name: daysToApplyName, value: dayToApplyValue, checked } = e.target;
    const { newAvailabilityPlan, newDayToApplyValues } = handleDayToApplyChange(
      {
        values,
        daysToApplyName,
        dayToApplyValue,
        availabilityPlan,
        checked,
        availabilityName: name,
      },
    );
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
