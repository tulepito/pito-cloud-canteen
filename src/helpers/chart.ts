import { formatTimestamp } from '@src/utils/dates';
import { ETimeFrame } from '@src/utils/enums';

export const formatAxisTickValue = (value: number) => {
  if (value >= 1000000000) {
    return `${Math.round(value / 1000000000)}t`;
  }
  if (value >= 1000000) {
    return `${Math.round(value / 1000000)}tr`;
  }
  if (value >= 1000) {
    return `${Math.round(value / 1000)}n`;
  }

  return `${value}`;
};

export const formatPartnerOrderXAxisTickValue = (
  value: number,
  timeFrame: ETimeFrame,
) => {
  switch (timeFrame) {
    case ETimeFrame.DAY: {
      const isStartOfMonth = new Date(value).getDate() === 1;

      return formatTimestamp(value, isStartOfMonth ? 'dd/MM' : 'dd');
    }
    case ETimeFrame.WEEK: {
      const next7DayTimestamp = value + 6 * 24 * 60 * 60 * 1000;

      return `${formatTimestamp(value, 'dd/MM')} - ${formatTimestamp(
        next7DayTimestamp,
        'dd/MM',
      )}`;
    }

    case ETimeFrame.MONTH: {
      return `T${formatTimestamp(value, 'MM/yyyy')}`;
    }
    default:
      return '';
  }
};

export const formatPartnerOrderTooltipLabel = (
  value: number,
  timeFrame: ETimeFrame,
) => {
  switch (timeFrame) {
    case ETimeFrame.DAY: {
      return formatTimestamp(value, 'dd/MM/yyyy');
    }
    case ETimeFrame.WEEK: {
      const next7DayTimestamp = value + 6 * 24 * 60 * 60 * 1000;

      return `${formatTimestamp(value, 'dd/MM')} - ${formatTimestamp(
        next7DayTimestamp,
        'dd/MM',
      )}`;
    }
    case ETimeFrame.MONTH: {
      return `Tháng ${formatTimestamp(value, 'MM/yyyy')}`;
    }
    default:
      return '';
  }
};
