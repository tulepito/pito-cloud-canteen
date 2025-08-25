import React from 'react';

import { Checkbox } from '@components/ui/checkbox';

type ReasonFieldProps = {
  checked: boolean;
  initialReason?: string;
  onChange: (checked: boolean, reason: string) => void;
  onChangeReasonInput: (reason: string) => void;
  maxLen?: number;
  placeholder?: string;
  readOnly?: boolean;
};

const ReasonFieldMealItemFailed = React.memo(function ReasonField({
  checked,
  initialReason = '',
  onChange,
  onChangeReasonInput,
  maxLen = 100,
  placeholder = 'Nhập lý do…',
  readOnly,
}: ReasonFieldProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const id = React.useId();

  const toggle = () => {
    const next = !checked;
    onChange(next, next ? initialReason : '');
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="flex items-center gap-2 cursor-pointer">
        <Checkbox
          id={id}
          checked={checked}
          onClick={toggle}
          disabled={readOnly}
        />
        {checked && initialReason && readOnly && (
          <span className="text-xs line-clamp-1" aria-disabled="true">
            {initialReason}
          </span>
        )}
      </label>

      {checked && !readOnly && (
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={initialReason}
            maxLength={maxLen}
            onChange={(e) => {
              onChangeReasonInput(e.target.value);
            }}
            placeholder={placeholder}
            className="border border-black px-2 py-1 rounded text-xs w-full max-w-[220px]"
          />
        </div>
      )}
    </div>
  );
});

export default ReasonFieldMealItemFailed;
