const NON_ACCENT_VIETNAMESE_CONVERTERS = [
  { to: 'a', from: 'à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ' },
  { to: 'e', from: 'è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ' },
  { to: 'i', from: 'ì|í|ị|ỉ|ĩ' },
  { to: 'o', from: 'ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ' },
  { to: 'u', from: 'ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ' },
  { to: 'y', from: 'ỳ|ý|ỵ|ỷ|ỹ' },
  { to: 'd', from: 'đ' },
  // Huyền sắc hỏi ngã nặng
  { to: '', from: '\u0300|\u0301|\u0303|\u0309|\u0323' },
  { to: '', from: '\u02C6|\u0306|\u031B' },
];

const toNonAccentVietnamese = (
  str,
  shouldLowCase = false,
  convertors = NON_ACCENT_VIETNAMESE_CONVERTERS,
) => {
  if (!str || typeof str !== 'string') return '';

  let text = shouldLowCase ? str.toLowerCase() : str;

  convertors.forEach(({ from, to }) => {
    text = text.replace(new RegExp(`[${from}]`, 'gi'), to);
  });

  return text;
};

module.exports = {
  toNonAccentVietnamese,
};
