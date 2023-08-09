export const addCommas = (num: string, separator = ',') =>
  num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);

export const removeNonNumeric = (num: string) =>
  num?.toString().replace(/[^0-9]/g, '');

export const parseThousandNumber = (
  value: string | number,
  separator = ',',
) => {
  return addCommas(
    removeNonNumeric(value !== null ? value?.toString() : '0'),
    separator,
  );
};
