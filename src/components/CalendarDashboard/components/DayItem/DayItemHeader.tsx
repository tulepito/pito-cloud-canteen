import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';

import type { TDayColumnHeaderProps } from '@components/CalendarDashboard/helpers/types';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useViewport } from '@hooks/useViewport';

import css from './DayItem.module.scss';

const DayColumnHeader: React.FC<TDayColumnHeaderProps> = ({
  isCurrentDay,
  isSelectedDay,
  date,
  className,
  shouldHideDate = false,
  shouldHideDateText = false,
  indicator,
  isDisabled = false,
}) => {
  const { isMobileLayout } = useViewport();

  return (
    <div
      className={classNames(
        css.dayHeader,
        {
          [css.disabledHeader]: isDisabled,
          [css.activeHeader]: isCurrentDay || isSelectedDay,
        },
        className,
      )}>
      <RenderWhen condition={indicator !== undefined}>
        <div
          className={classNames(
            css.indicator,
            indicator ? css.valid : css.invalid,
          )}></div>
      </RenderWhen>
      <RenderWhen condition={!shouldHideDate}>
        <div className={css.dateNumber}>{date.getDate()}</div>
      </RenderWhen>
      <RenderWhen condition={!shouldHideDateText}>
        <div className={css.dayText}>
          <FormattedMessage
            id={`Calendar.week.dayHeader.${
              isMobileLayout ? 'short.' : ''
            }${date.getDay()}`}
            values={{ date: date.getDate(), month: date.getMonth() + 1 }}
          />{' '}
        </div>
      </RenderWhen>
    </div>
  );
};

export default DayColumnHeader;
