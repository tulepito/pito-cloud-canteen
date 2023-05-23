const addCommas = (num) =>
  num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const removeNonNumeric = (num) => num?.toString().replace(/[^0-9]/g, '');

const parseThousandNumber = (value) => {
  return addCommas(removeNonNumeric(value.toString()));
};

module.exports = {
  parseThousandNumber,
};
