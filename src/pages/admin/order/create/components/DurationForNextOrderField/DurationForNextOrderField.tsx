import Button from '@components/Button/Button';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import classNames from 'classnames';
import { useState } from 'react';
import { useIntl } from 'react-intl';

import css from './DurationForNextOrderField.module.scss';

type DurationForNextOrderFieldProps = {
  form: any;
  displayedDurationTimeValue: string;
};
const DurationForNextOrderField: React.FC<DurationForNextOrderFieldProps> = (
  props,
) => {
  const { form, displayedDurationTimeValue } = props;
  const intl = useIntl();
  const [timeMode, setTimeMode] = useState<'week' | 'month'>('week');
  const onTimeModeChange = (mode: 'week' | 'month') => () => {
    setTimeMode(mode);
    form.change('durationTimeMode', mode);
    if (mode === 'month') {
      form.change('durationTime', parseInt(displayedDurationTimeValue, 10) * 4);
    } else {
      form.change('durationTime', +displayedDurationTimeValue);
    }
  };
  return (
    <div className={css.container}>
      <div className={css.fieldLabel}>
        {intl.formatMessage({ id: 'DurationForNextOrderField.label' })}
      </div>
      <div className={css.fieldWrapper}>
        <FieldTextInput
          id="displayedDurationTime"
          name="displayedDurationTime"
          type="number"
          className={css.durationTimeInput}
        />
        <div className={css.timeModeBtnWrapper}>
          <Button
            type="button"
            onClick={onTimeModeChange('week')}
            className={classNames(
              css.viewMode,
              timeMode === 'week' && css.active,
            )}>
            {intl.formatMessage({ id: 'DurationForNextOrderField.week' })}
          </Button>
          <Button
            type="button"
            onClick={onTimeModeChange('month')}
            className={classNames(
              css.viewMode,
              timeMode === 'month' && css.active,
            )}>
            {intl.formatMessage({ id: 'DurationForNextOrderField.month' })}
          </Button>
        </div>
      </div>
      <FieldTextInput id="durationTime" name="durationTime" type="hidden" />
      <FieldTextInput
        id="durationTimeMode"
        name="durationTimeMode"
        type="hidden"
      />
    </div>
  );
};

export default DurationForNextOrderField;
