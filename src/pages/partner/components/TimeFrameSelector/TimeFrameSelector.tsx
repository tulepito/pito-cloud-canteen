import classNames from 'classnames';

import { getDisabledTimeFrameOptions } from '@pages/partner/helpers/dashboardData';
import { timeFrameOptions } from '@pages/partner/hooks/useControlTimeFrame';
import type { ETimeFrame, ETimePeriodOption } from '@src/utils/enums';

import css from './TimeFrameSelector.module.scss';

type TTimeFrameSelectorProps = {
  timeFrame: ETimeFrame;
  setTimeFrame: (timeFrame: ETimeFrame) => void;
  timePeriodOption: ETimePeriodOption;
};

const TimeFrameSelector: React.FC<TTimeFrameSelectorProps> = (props) => {
  const { timeFrame, setTimeFrame, timePeriodOption } = props;

  const disabledTimeFrameOptions =
    getDisabledTimeFrameOptions(timePeriodOption);
  const handleSelectTimeFrame = (timeFramOption: ETimeFrame) => () => {
    if (disabledTimeFrameOptions.includes(timeFramOption)) {
      return;
    }

    setTimeFrame(timeFramOption);
  };

  return (
    <div className={css.root}>
      {timeFrameOptions.map(({ key, label }) => (
        <div
          key={key}
          onClick={handleSelectTimeFrame(key)}
          className={classNames(
            css.timeFrame,
            key === timeFrame && css.active,
            disabledTimeFrameOptions.includes(key) && css.disabled,
          )}>
          {label}
        </div>
      ))}
    </div>
  );
};

export default TimeFrameSelector;
