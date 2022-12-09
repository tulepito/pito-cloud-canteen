export enum ErrorCodes {
  ERROR_CODE_TRANSACTION_LISTING_NOT_FOUND = 'transaction-listing-not-found',
  ERROR_CODE_TRANSACTION_INVALID_TRANSITION = 'transaction-invalid-transition',
  ERROR_CODE_TRANSACTION_ALREADY_REVIEWED_BY_CUSTOMER = 'transaction-already-reviewed-by-customer',
  ERROR_CODE_TRANSACTION_ALREADY_REVIEWED_BY_PROVIDER = 'transaction-already-reviewed-by-provider',
  ERROR_CODE_TRANSACTION_BOOKING_TIME_NOT_AVAILABLE = 'transaction-booking-time-not-available',
  ERROR_CODE_PAYMENT_FAILED = 'transaction-payment-failed',
  ERROR_CODE_CHARGE_ZERO_PAYIN = 'transaction-charge-zero-payin',
  ERROR_CODE_CHARGE_ZERO_PAYOUT = 'transaction-charge-zero-payout',
  ERROR_CODE_EMAIL_TAKEN = 'email-taken',
  ERROR_CODE_EMAIL_NOT_FOUND = 'email-not-found',
  ERROR_CODE_TOO_MANY_VERIFICATION_REQUESTS = 'email-too-many-verification-requests',
  ERROR_CODE_UPLOAD_OVER_LIMIT = 'request-upload-over-limit',
  ERROR_CODE_VALIDATION_INVALID_PARAMS = 'validation-invalid-params',
  ERROR_CODE_VALIDATION_INVALID_VALUE = 'validation-invalid-value',
  ERROR_CODE_NOT_FOUND = 'not-found',
  ERROR_CODE_FORBIDDEN = 'forbidden',
  ERROR_CODE_MISSING_STRIPE_ACCOUNT = 'transaction-missing-stripe-account',
}

// API error
// TODO this is likely to change soonish
export type TApiError = {
  id: String;
  status: Number;
  code: ErrorCodes;
  title: String;
  meta: Record<string, unknown>;
};

// Storable error prop type. (Error object should not be stored as it is.)
export type TError = {
  type: 'error';
  name: String;
  message?: String;
  status?: Number;
  statusText: String;
  apiErrors: TApiError[];
};

// Options for showing just date or date and time on BookingTimeInfo and BookingBreakdown
// export const DATE_TYPE_DATE = 'date';
// export const DATE_TYPE_DATETIME = 'datetime';

// propTypes.dateType = oneOf([DATE_TYPE_DATE, DATE_TYPE_DATETIME]);
