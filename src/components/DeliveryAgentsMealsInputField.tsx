import { useEffect, useState } from 'react';

import { Input } from './ui/input';
import { Label } from './ui/label';

export const DeliveryAgentsMealsInputField = ({
  label,
  defaultValue,
  loading,
  disabled,
  description,

  onChange,
}: {
  label: string;
  defaultValue: number | string;
  loading: boolean;
  disabled: boolean;
  description?: string;

  onChange?: (value: number) => void;
}) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const bgColor = +value > 0 ? 'bg-gray-200' : 'bg-gray-50';
  const textColor = +value > 0 ? 'text-blue-600' : 'text-black';

  return (
    <div
      className={`bg-gray-100 rounded-lg p-2 flex flex-col gap-1 w-[120px] ${bgColor}`}>
      <Label className={`text-xs font-bold ${textColor}`}>{label}</Label>
      <span className="line-clamp-1 text-xs">{description}</span>
      <div className="relative">
        <Input
          className="rounded-lg border border-solid border-neutral-600"
          placeholder="0"
          value={value}
          disabled={disabled}
          onBlur={(event) => {
            const newValue = event.target.value;
            if (onChange) {
              onChange(Number(newValue));
            }
          }}
          onChange={(event) => {
            const newValue = event.target.value;
            setValue(newValue);
          }}
        />
        <div className="absolute bottom-[10px] right-[16px] w-[16px] h-[16px] flex items-center justify-center">
          phần
        </div>
      </div>
      {loading && (
        <div className="absolute bottom-[10px] right-[16px] w-[16px] h-[16px] flex items-center justify-center">
          Loading...
        </div>
      )}
    </div>
  );
};
