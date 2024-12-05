const getFullName = (profile) => {
  if (!profile) return 'Anh/Chị';

  const { firstName, lastName } = profile;

  const formatName = (name) => (typeof name === 'string' ? name.trim() : '');

  const fullName = [formatName(lastName), formatName(firstName)]
    .join(' ')
    .trim();

  return fullName || 'Anh/Chị';
};

module.exports = {
  getFullName,
};
