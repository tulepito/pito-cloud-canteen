export const splitNameFormFullName = (fullName: string) => {
  const firstSpaceIndx = fullName.split('').findIndex((ch) => ch === ' ');
  if (firstSpaceIndx === -1) {
    return { firstName: fullName };
  }

  return {
    firstName: fullName.slice(0, firstSpaceIndx),
    lastName: fullName.slice(firstSpaceIndx + 1),
  };
};
