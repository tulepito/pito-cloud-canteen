const buildFullName = (
  firstName?: string,
  lastName?: string,
  options?: {
    compareToGetLongerWith?: string;
  },
) => {
  if (!firstName || !lastName) return firstName || lastName || '';

  if (firstName === lastName) return firstName;

  const fullName = `${lastName} ${firstName}`;
  if (!options) return fullName;

  const { compareToGetLongerWith } = options;

  if (!compareToGetLongerWith) return fullName;

  if (fullName.length < compareToGetLongerWith.length) {
    return compareToGetLongerWith;
  }

  return fullName;
};

export default buildFullName;
