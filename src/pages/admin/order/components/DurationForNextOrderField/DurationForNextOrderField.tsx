import { useState } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

import Button from '@components/Button/Button';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import { parseThousandNumber } from '@helpers/format';

import css from './DurationForNextOrderField.module.scss';

type DurationForNextOrderFieldProps = {
  form: any;
  displayedDurationTimeValue: string;
  title?: string;
  containerClassName?: string;
  disabled?: boolean;
};
const DurationForNextOrderField: React.FC<DurationForNextOrderFieldProps> = (
  props,
) => {
  const {
    form,
    disabled = false,
    displayedDurationTimeValue,
    title,
    containerClassName,
  } = props;
  const intl = useIntl();
  const [timeMode, setTimeMode] = useState<'week' | 'month'>('week');
  const containerClasses = classNames(css.container, containerClassName);
  const onTimeModeChange = (mode: 'week' | 'month') => () => {
    setTimeMode(mode);
    form.change('durationTimeMode', mode);
    if (mode === 'month') {
      form.change('durationTime', parseInt(displayedDurationTimeValue, 10) * 4);
    } else {
      form.change('durationTime', +displayedDurationTimeValue);
    }
  };

  const handleParseNumber = (value: string) => {
    return parseThousandNumber(value);
  };

  return (
    <div className={containerClasses}>
      {title && <div className={css.fieldLabel}>{title}</div>}
      <div className={css.fieldWrapper}>
        <FieldTextInput
          id="displayedDurationTime"
          name="displayedDurationTime"
          type="text"
          className={css.durationTimeInput}
          placeholder="1"
          parse={handleParseNumber}
          disabled={disabled}
        />
        <div className={css.timeModeBtnWrapper}>
          <Button
            type="button"
            onClick={onTimeModeChange('week')}
            disabled={disabled}
            className={classNames(
              css.viewMode,
              timeMode === 'week' && css.active,
            )}>
            {intl.formatMessage({ id: 'DurationForNextOrderField.week' })}
          </Button>
          <Button
            type="button"
            onClick={onTimeModeChange('month')}
            disabled={disabled}
            className={classNames(
              css.viewMode,
              timeMode === 'month' && css.active,
            )}>
            {intl.formatMessage({ id: 'DurationForNextOrderField.month' })}
          </Button>
        </div>
      </div>
      <FieldTextInput
        id="durationTime"
        name="durationTime"
        type="hidden"
        disabled={disabled}
      />
      <FieldTextInput
        disabled={disabled}
        id="durationTimeMode"
        name="durationTimeMode"
        type="hidden"
      />
    </div>
  );
};

export default DurationForNextOrderField;
