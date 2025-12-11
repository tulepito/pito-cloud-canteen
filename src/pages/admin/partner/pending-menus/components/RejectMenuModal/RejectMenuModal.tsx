import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import Button from '@components/Button/Button';

type TRejectMenuModalProps = {
  isOpen: boolean;
  menuTitle: string;
  onClose: () => void;
  onReject: (reason: string) => void;
  isRejecting?: boolean;
};

const RejectMenuModal = ({
  isOpen,
  menuTitle,
  onClose,
  onReject,
  isRejecting = false,
}: TRejectMenuModalProps) => {
  const intl = useIntl();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReason(e.target.value);
    if (error && e.target.value.trim()) {
      setError('');
    }
  };

  const handleSubmit = () => {
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      setError(
        intl.formatMessage({
          id: 'RejectMenuModal.reasonRequired',
        }),
      );

      return;
    }
    onReject(trimmedReason);
  };

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
        onClick={handleClose}>
        {/* Modal */}
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}>
          {/* Content */}
          <div className="p-6 text-center">
            {/* Warning Icon */}
            <div className="w-16 h-16 mx-auto mb-4 bg-black/10 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              <FormattedMessage id="RejectMenuModal.title" />
            </h3>

            {/* Message */}
            <p className="text-gray-600 mb-6">
              <FormattedMessage
                id="RejectMenuModal.message"
                values={{
                  menuTitle: (
                    <strong className="text-black">{menuTitle}</strong>
                  ),
                }}
              />
            </p>

            {/* Textarea */}
            <div className="text-left mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FormattedMessage id="RejectMenuModal.reasonLabel" />
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                className={`w-full px-4 py-3 border rounded-xl text-sm resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-black-500/20 focus:border-black-500 ${
                  error ? 'border-black-500 bg-red-50' : 'border-gray-300'
                }`}
                value={reason}
                onChange={handleReasonChange}
                placeholder={intl.formatMessage({
                  id: 'RejectMenuModal.reasonPlaceholder',
                })}
                rows={4}
                disabled={isRejecting}
              />
              {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            </div>

            {/* Note */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-left mb-6">
              <p className="text-sm text-amber-700">
                <FormattedMessage id="RejectMenuModal.note" />
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 px-6 pb-6">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={handleClose}
              disabled={isRejecting}>
              <FormattedMessage id="RejectMenuModal.cancel" />
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleSubmit}
              inProgress={isRejecting}
              disabled={!reason.trim()}>
              <FormattedMessage id="RejectMenuModal.confirm" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RejectMenuModal;
