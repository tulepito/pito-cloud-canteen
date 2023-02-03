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
