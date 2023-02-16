export const httpStatusCodes = {
  success: 200,
  forbidden: 403,
  notfound: 400,
  conflict: 409,
};

export const errorMessages = {
  VALIDATE_MENU_ERROR_CONFLICT: {
    message: 'Bữa ăn trong ngày đã có sẵn menu',
    id: 'validate-menu-error-conflict',
    code: httpStatusCodes.conflict,
  },
  BAD_REQUEST: {
    message: 'Bad request',
    id: 'bad-request',
    code: httpStatusCodes.notfound,
  },
};
