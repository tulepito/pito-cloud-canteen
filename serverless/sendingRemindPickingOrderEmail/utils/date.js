const { DateTime } = require('luxon');

const VNTimezone = 'Asia/Ho_Chi_Minh';

const calculateRemainTime = (futureTimestamp = new Date().getTime()) => {
  const futureTime = DateTime.fromMillis(futureTimestamp);

  // Get the current time as a DateTime object
  const currentTime = DateTime.local();

  // Calculate the remaining time as a Duration object
  const remainingTime = futureTime.diff(currentTime);

  // Format the remaining time as a string
  return remainingTime.toFormat('hh:mm:ss');
};

const formatTimestamp = (
  // eslint-disable-next-line default-param-last
  date = new Date().getTime(),
  format,
  timeZone = VNTimezone,
) => {
  return DateTime.fromMillis(Number(date))
    .setZone(timeZone)
    .toFormat(format || 'dd/MM/yyyy', {
      locale: 'vi',
    });
};

module.exports = {
  VNTimezone,
  calculateRemainTime,
  formatTimestamp,
};
