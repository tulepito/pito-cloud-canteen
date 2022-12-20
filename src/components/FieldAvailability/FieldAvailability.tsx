import { InlineTextButton } from '@components/Button/Button';
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

const printHourStrings = (h: any) => (h > 9 ? `${h}:00` : `0${h}:00`);

const HOURS = Array(24).fill(1);
const ALL_START_HOURS = [...HOURS].map((v, i) => printHourStrings(i));
const ALL_END_HOURS = [...HOURS].map((v, i) => printHourStrings(i + 1));

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
        return fields.map((name: any, index: any) => {
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
            <tr key={`$_index`} className={css.dailyPlanWrapper}>
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
                    <IconClose size="small" />
                  </InlineTextButton>
                )}
                <InlineTextButton
                  key={name}
                  onClick={() =>
                    fields.push({ startTime: null, endTime: null })
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
  const { values, name } = props;
  const intl = useIntl();
  return (
    <div className={css.root}>
      <p>{intl.formatMessage({ id: 'FieldAvailability.label' })}</p>
      <div className={css.wrapper}>
        <div className={css.listDay}>
          <p className={css.listDayLabel}>
            {intl.formatMessage({ id: 'FieldAvailability.dateLabel' })}
          </p>
          <div className={css.dayPicker}>
            {Object.keys(EDayOfWeek).map((day: string) => {
              return (
                <InlineTextButton className={css.dayButton} key={day}>
                  {intl.formatMessage({ id: `FieldAvailability.${day}Label` })}
                </InlineTextButton>
              );
            })}
            <InlineTextButton className={css.dayButton}>
              {intl.formatMessage({ id: `FieldAvailability.allWeek` })}
            </InlineTextButton>
          </div>
        </div>
        <div className={css.dailyPlanWrapper}>
          <p className={css.listDayLabel}>
            {intl.formatMessage({ id: 'FieldAvailability.dailyPlanLabel' })}
          </p>
          <div className={css.dailyPlanOptionsWrapper}>
            <FieldRadioButton
              name="allWeekApply"
              id="allWeekApply"
              label={intl.formatMessage({
                id: 'FieldAvailability.allWeekApply',
              })}
            />
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
                  {Object.keys(EDayOfWeek).map((w) => {
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
            <FieldRadioButton
              name="singleDayApply"
              id="singleDayApply"
              label={intl.formatMessage({
                id: 'FieldAvailability.singleDayApply',
              })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldAvailability;
