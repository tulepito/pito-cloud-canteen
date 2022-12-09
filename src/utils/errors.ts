/**
 * ================ API error handling utilities ================
 *
 * This module exports helpers that can be used to check if API
 * response errors are some specific error cases.
 *
 * NOTE: most of the functions are tied to an endpoint, and should not
 * be used to check error responses from any other endpoint. Check the
 * name and the docstring of the function to ensure correct usage.
 */

import type { TApiError, TError } from './types';
import { ErrorCodes } from './types';

const errorAPIErrors = (error: TError) => {
  return error && error.apiErrors ? error.apiErrors : [];
};

const hasErrorWithCode = (error: TError, code: string) => {
  return errorAPIErrors(error).some((apiError: TApiError) => {
    return apiError.code === code;
  });
};

/**
 * return apiErrors from error response
 */
const responseAPIErrors = (error: any) => {
  return error && error.data && error.data.errors ? error.data.errors : [];
};

/**
 * Check if the given API error (from `sdk.currentuser.create()`) is
 * due to the email address already being in use.
 */
export const isSignupEmailTakenError = (error: TError) =>
  hasErrorWithCode(error, ErrorCodes.ERROR_CODE_EMAIL_TAKEN);

/**
 * Check if the given API error (from `sdk.currentuser.changeEmail()`) is
 * due to the email address already being in use.
 */
export const isChangeEmailTakenError = (error: TError) =>
  hasErrorWithCode(error, ErrorCodes.ERROR_CODE_EMAIL_TAKEN);

/**
 * Check if the given API error (from
 * `sdk.currentUser.sendVerificationEmail()`) is due to too many
 * active email verification requests.
 *
 * There qre only a specific amount of active verification requests
 * allowed, and the user has to wait for them to expire to be able to
 * request sending new verification emails.
 */
export const isTooManyEmailVerificationRequestsError = (error: TError) =>
  hasErrorWithCode(error, ErrorCodes.ERROR_CODE_TOO_MANY_VERIFICATION_REQUESTS);

/**
 * Check if the given API error (from
 * `sdk.images.upload()`) is due to the image being over
 * the size limit.
 */
export const isUploadImageOverLimitError = (error: TError) =>
  hasErrorWithCode(error, ErrorCodes.ERROR_CODE_UPLOAD_OVER_LIMIT);

/**
 * Check if the given API error (from `sdk.passwordReset.request()`)
 * is due to no user having the given email address.
 */
export const isPasswordRecoveryEmailNotFoundError = (error: TError) =>
  hasErrorWithCode(error, ErrorCodes.ERROR_CODE_EMAIL_NOT_FOUND);

/**
 * Check if the given API error (from `sdk.transaction.initiate()` or
 * `sdk.transaction.initiateSpeculative()`) is due to the listing
 * being closed or deleted.
 */
export const isTransactionInitiateListingNotFoundError = (error: TError) =>
  hasErrorWithCode(error, ErrorCodes.ERROR_CODE_TRANSACTION_LISTING_NOT_FOUND);

/**
 * Check if the given API error (from `sdk.transaction.initiate()` or
 * `sdk.transaction.initiateSpeculative()`) is due to missign Stripe
 * connection from the listing author.
 */
export const isTransactionInitiateMissingStripeAccountError = (error: TError) =>
  hasErrorWithCode(error, ErrorCodes.ERROR_CODE_MISSING_STRIPE_ACCOUNT);

/**
 * Check if the given API error (from `sdk.transaction.initiate()` or
 * `sdk.transaction.initiateSpeculative()`) is due to selected booking
 * time already being booked.
 */
export const isTransactionInitiateBookingTimeNotAvailableError = (
  error: TError,
) =>
  hasErrorWithCode(
    error,
    ErrorCodes.ERROR_CODE_TRANSACTION_BOOKING_TIME_NOT_AVAILABLE,
  );

/**
 * Check if the given API error (from `sdk.transaction.initiate()` or
 * `sdk.transaction.initiateSpeculative()`) is due to payment being zero.
 */
export const isTransactionZeroPaymentError = (error: TError) =>
  hasErrorWithCode(error, ErrorCodes.ERROR_CODE_CHARGE_ZERO_PAYIN);

/**
 * Check if the given API error (from `sdk.transaction.initiate()`) is
 * due to the transaction total amount being too low for Stripe.
 */
export const isTransactionInitiateAmountTooLowError = (error: TError) => {
  const isZeroPayment = isTransactionZeroPaymentError(error);

  const tooLowAmount = errorAPIErrors(error).some((apiError: TApiError) => {
    const isPaymentFailedError =
      apiError.status === 402 &&
      apiError.code === ErrorCodes.ERROR_CODE_PAYMENT_FAILED;
    let isAmountTooLow = false;

    try {
      // TODO: This is a temporary solution until a proper error code
      // for this specific error is received in the response.
      const msg = apiError.meta.stripeMessage as string;
      isAmountTooLow =
        msg.startsWith('Amount must be at least') ||
        msg.startsWith('Amount must convert to at least');
    } catch (e) {
      // Ignore
    }

    return isPaymentFailedError && isAmountTooLow;
  });

  return isZeroPayment || tooLowAmount;
};

/**
 * Check if the given API error (from `sdk.transaction.initiate()`) is
 * due to the transaction charge creation disabled by Stripe.
 */
export const isTransactionChargeDisabledError = (error: TError) => {
  const chargeCreationDisabled = errorAPIErrors(error).some((apiError) => {
    const isPaymentFailedError =
      apiError.status === 402 &&
      apiError.code === ErrorCodes.ERROR_CODE_PAYMENT_FAILED;

    let isChargeCreationDisabled = false;
    try {
      const msg = apiError.meta.stripeMessage as string;
      isChargeCreationDisabled =
        msg.startsWith('Your account cannot currently make charges.') ||
        msg.match(/verification.disabled_reason/) !== null;
    } catch (e) {
      // Ignore
    }

    return isPaymentFailedError && isChargeCreationDisabled;
  });

  return chargeCreationDisabled;
};

/**
 * Check if the given API error (from `sdk.transaction.initiate()`) is
 * due to other error in Stripe.
 */
export const transactionInitiateOrderStripeErrors = (error: TError) => {
  if (error) {
    return errorAPIErrors(error).reduce((messages, apiError) => {
      const isPaymentFailedError =
        apiError.status === 402 &&
        apiError.code === ErrorCodes.ERROR_CODE_PAYMENT_FAILED;
      const hasStripeError =
        apiError && apiError.meta && apiError.meta.stripeMessage;
      const stripeMessageMaybe =
        isPaymentFailedError && hasStripeError
          ? [apiError.meta.stripeMessage as string]
          : [];
      return [...messages, ...stripeMessageMaybe];
    }, [] as string[]);
  }
  return null;
};

/**
 * Check if the given API error (from `sdk.transactions.transition(id, transition, params)`)
 * is due to invalid transition attempt.
 */
export const isTransactionsTransitionInvalidTransition = (error: TError) =>
  error &&
  error.status === 409 &&
  hasErrorWithCode(error, ErrorCodes.ERROR_CODE_TRANSACTION_INVALID_TRANSITION);

/**
 * Check if the given API error (from `sdk.transactions.transition(id, transition, params)`)
 * is due to already sent review.
 */
export const isTransactionsTransitionAlreadyReviewed = (error: TError) =>
  error &&
  error.status === 409 &&
  (hasErrorWithCode(
    error,
    ErrorCodes.ERROR_CODE_TRANSACTION_ALREADY_REVIEWED_BY_CUSTOMER,
  ) ||
    hasErrorWithCode(
      error,
      ErrorCodes.ERROR_CODE_TRANSACTION_ALREADY_REVIEWED_BY_PROVIDER,
    ));

/**
 * Check if the given API error (from `sdk.currentUser.changeEmail(params)`)
 * is due to giving wrong password.
 */
export const isChangeEmailWrongPassword = (error: TError) =>
  error && error.status === 403;

/**
 * Check if the given API error (from `sdk.currentUser.changePassword(params)`)
 * is due to giving wrong password.
 */
export const isChangePasswordWrongPassword = (error: TError) =>
  error && error.status === 403;

/**
 * Check if the given API error (from
 * 'sdk.stripeAccount.create(payoutDetails)') is due to
 * invalid postal code in the given country.
 */
export const isStripeInvalidPostalCode = (error: TError) => {
  const msgRe = /^Invalid [A-Z]{2} postal code$/;
  return errorAPIErrors(error).some((apiError) => {
    // Stripe doesn't seem to give an error code for this specific
    // case, so we have to recognize it from the message.
    const msg =
      apiError.meta && apiError.meta.stripeMessage
        ? apiError.meta.stripeMessage
        : '';
    return msgRe.test(msg as string);
  });
};

export const isStripeError = (error: TError) => {
  return errorAPIErrors(error).some((apiError) => {
    // Stripe doesn't seem to give an error code for this specific
    // case, so we have to recognize it from the message.
    return !!(apiError.meta && apiError.meta.stripeMessage);
  });
};

export const storableError = (error: any) => {
  const err = error || {};
  const { name, message, status, statusText } = err;
  // Status, statusText, and data.errors are (possibly) added to the error object by SDK
  const apiErrors = responseAPIErrors(err);

  // Returned object is the same as prop type check in util/types -> error
  return {
    type: 'error',
    name,
    message,
    status,
    statusText,
    apiErrors,
  };
};

export const responseApiErrorInfo = (error: any) =>
  responseAPIErrors(error).map((e: any) => ({
    status: e.status,
    code: e.code,
    meta: e.meta,
  }));
