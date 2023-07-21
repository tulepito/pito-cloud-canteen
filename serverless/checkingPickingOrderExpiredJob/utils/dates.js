const { DateTime } = require('luxon');

const diffDays = (date1, date2, units) => {
  const diffObject = DateTime.fromMillis(date1)
    .diff(DateTime.fromMillis(date2), units)
    .toObject();

  return diffObject;
};

module.exports = {
  diffDays,
};
