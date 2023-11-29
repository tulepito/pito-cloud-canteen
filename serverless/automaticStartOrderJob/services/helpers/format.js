const addCommas = (num, separator = ',') =>
  num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);

const removeNonNumeric = (num) => num?.toString().replace(/[^0-9]/g, '');

const parseThousandNumber = (value, separator = ',') => {
  return addCommas(
    removeNonNumeric(value !== null ? value?.toString() : '0'),
    separator,
  );
};

module.exports = {
  parseThousandNumber,
};
