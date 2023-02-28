export const convertQueryValueToArray = (value?: string | string[]) => {
  if (Array.isArray(value)) {
    return value;
  }
  if (!value) {
    return [];
  }
  return value.split(',');
};
