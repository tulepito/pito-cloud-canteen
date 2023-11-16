const { DateTime } = require('luxon');

const VNTimezone = 'Asia/Ho_Chi_Minh';

const formatTimestamp = (
  // eslint-disable-next-line default-param-last
  date = new Date().getTime(),
  format,
  locale = 'vi',
  timeZone = VNTimezone,
) => {
  return DateTime.fromMillis(Number(date))
    .setZone(timeZone)
    .toFormat(format || 'dd/MM/yyyy', {
      locale,
    });
};

module.exports = {
  formatTimestamp,
};
