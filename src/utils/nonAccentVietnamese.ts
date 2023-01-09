// This function converts the string to lowercase, then perform the conversion
export const toLowerCaseNonAccentVietnamese = (str: string) => {
  let lowercaseConvertedStr = str.toLowerCase();
  //     We can also use this instead of from line 11 to line 17
  //     str = str.replace(/\u00E0|\u00E1|\u1EA1|\u1EA3|\u00E3|\u00E2|\u1EA7|\u1EA5|\u1EAD|\u1EA9|\u1EAB|\u0103|\u1EB1|\u1EAF|\u1EB7|\u1EB3|\u1EB5/g, "a");
  //     str = str.replace(/\u00E8|\u00E9|\u1EB9|\u1EBB|\u1EBD|\u00EA|\u1EC1|\u1EBF|\u1EC7|\u1EC3|\u1EC5/g, "e");
  //     str = str.replace(/\u00EC|\u00ED|\u1ECB|\u1EC9|\u0129/g, "i");
  //     str = str.replace(/\u00F2|\u00F3|\u1ECD|\u1ECF|\u00F5|\u00F4|\u1ED3|\u1ED1|\u1ED9|\u1ED5|\u1ED7|\u01A1|\u1EDD|\u1EDB|\u1EE3|\u1EDF|\u1EE1/g, "o");
  //     str = str.replace(/\u00F9|\u00FA|\u1EE5|\u1EE7|\u0169|\u01B0|\u1EEB|\u1EE9|\u1EF1|\u1EED|\u1EEF/g, "u");
  //     str = str.replace(/\u1EF3|\u00FD|\u1EF5|\u1EF7|\u1EF9/g, "y");
  //     str = str.replace(/\u0111/g, "d");
  lowercaseConvertedStr = lowercaseConvertedStr.replace(
    /à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,
    'a',
  );
  lowercaseConvertedStr = lowercaseConvertedStr.replace(
    /è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,
    'e',
  );
  lowercaseConvertedStr = lowercaseConvertedStr.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  lowercaseConvertedStr = lowercaseConvertedStr.replace(
    /ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,
    'o',
  );
  lowercaseConvertedStr = lowercaseConvertedStr.replace(
    /ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,
    'u',
  );
  lowercaseConvertedStr = lowercaseConvertedStr.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  lowercaseConvertedStr = lowercaseConvertedStr.replace(/đ/g, 'd');
  // Some system encode vietnamese combining accent as individual utf-8 characters
  lowercaseConvertedStr = lowercaseConvertedStr.replace(
    /\u0300|\u0301|\u0303|\u0309|\u0323/g,
    '',
  ); // Huyền sắc hỏi ngã nặng
  lowercaseConvertedStr = lowercaseConvertedStr.replace(
    /\u02C6|\u0306|\u031B/g,
    '',
  ); // Â, Ê, Ă, Ơ, Ư
  return lowercaseConvertedStr;
};

// This function keeps the casing unchanged for str, then perform the conversion
export const toNonAccentVietnamese = (str: string) => {
  let newResult = str;

  newResult = newResult.replace(/A|Á|À|Ã|Ạ|Â|Ấ|Ầ|Ẫ|Ậ|Ă|Ắ|Ằ|Ẵ|Ặ/g, 'A');
  newResult = newResult.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  newResult = newResult.replace(/E|É|È|Ẽ|Ẹ|Ê|Ế|Ề|Ễ|Ệ/, 'E');
  newResult = newResult.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  newResult = newResult.replace(/I|Í|Ì|Ĩ|Ị/g, 'I');
  newResult = newResult.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  newResult = newResult.replace(/O|Ó|Ò|Õ|Ọ|Ô|Ố|Ồ|Ỗ|Ộ|Ơ|Ớ|Ờ|Ỡ|Ợ/g, 'O');
  newResult = newResult.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  newResult = newResult.replace(/U|Ú|Ù|Ũ|Ụ|Ư|Ứ|Ừ|Ữ|Ự/g, 'U');
  newResult = newResult.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  newResult = newResult.replace(/Y|Ý|Ỳ|Ỹ|Ỵ/g, 'Y');
  newResult = newResult.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  newResult = newResult.replace(/Đ/g, 'D');
  newResult = newResult.replace(/đ/g, 'd');
  // Some system encode vietnamese combining accent as individual utf-8 characters
  newResult = newResult.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ''); // Huyền sắc hỏi ngã nặng
  newResult = newResult.replace(/\u02C6|\u0306|\u031B/g, ''); // Â, Ê, Ă, Ơ, Ư

  return newResult;
};
