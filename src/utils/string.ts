export const splitNameFormFullName = (fullName: string) => {
  const firstSpaceIndx = fullName.split('').findIndex((ch) => ch === ' ');

  if (firstSpaceIndx === -1) {
    return { firstName: fullName, lastName: fullName };
  }

  return {
    firstName: fullName.slice(0, firstSpaceIndx),
    lastName: fullName.slice(firstSpaceIndx + 1),
  };
};

export const shortenString = (
  str: string,
  maxLength: number,
  position: 'end' | 'center' = 'center',
) => {
  const { length } = str;

  if (length <= maxLength) {
    return str;
  }

  if (position === 'end') {
    return `${str.slice(0, maxLength)}...`;
  }

  return `${str.slice(0, maxLength / 2)}...${str.slice(
    length - maxLength / 2,
  )}`;
};

export const removeAccents = (str: string) => {
  return str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';
};

export const capitalize = (str: string) => {
  const arr = str.split(' ');
  for (let i = 0; i < arr.length; i++) {
    arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
  }
  const str2 = arr.join(' ');

  return str2;
};
