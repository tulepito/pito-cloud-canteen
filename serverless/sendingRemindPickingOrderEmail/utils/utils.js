const addCommas = (num) =>
  num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const removeNonNumeric = (num) => num?.toString().replace(/[^0-9]/g, '');

const parseThousandNumber = (value = 0) => {
  return addCommas(removeNonNumeric(value !== null ? value.toString() : '0'));
};

module.exports = {
  parseThousandNumber,
};
