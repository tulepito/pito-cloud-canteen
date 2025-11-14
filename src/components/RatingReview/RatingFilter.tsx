import React, { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import Button from '@components/Button/Button';
import { Checkbox } from '@components/ui/checkbox';

type TRatingDetail = {
  rating: number;
};

type RatingFilterProps = {
  ratingDetail: TRatingDetail[];
  selected?: number[];
  onSubmit?: (ratings: number[]) => void;
};

const RatingFilter = ({
  ratingDetail,
  selected = [],
  onSubmit,
}: RatingFilterProps) => {
  const intl = useIntl();
  const [tempSelected, setTempSelected] = useState<number[]>(selected);

  useEffect(() => {
    setTempSelected(selected);
  }, [selected]);

  const options = useMemo(() => {
    return ratingDetail.map((detail) => {
      const label = intl.formatMessage({
        id: `FieldRating.label.${detail.rating}`,
      });

      return { value: detail.rating, label };
    });
  }, [intl, ratingDetail]);

  const toggle = (value: number) => {
    setTempSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const handleClear = () => {
    setTempSelected([]);
    onSubmit?.([]);
  };

  const handleSubmit = () => {
    onSubmit?.(tempSelected);
  };

  const hasChanges = useMemo(() => {
    const sortedTemp = [...tempSelected].sort((a, b) => a - b);
    const sortedSelected = [...selected].sort((a, b) => a - b);

    return JSON.stringify(sortedTemp) !== JSON.stringify(sortedSelected);
  }, [tempSelected, selected]);

  const isApplyDisabled = !hasChanges;

  return (
    <div className="min-w-[320px] rounded-xl bg-white shadow-lg text-xs">
      {/* Rating Options */}
      <div className="space-y-2 px-2 py-2">
        {options.map(({ value, label }) => {
          const checked = tempSelected.includes(value);

          return (
            <div
              key={value}
              onClick={() => toggle(value)}
              className="group cursor-pointer rounded-lg px-4 py-2 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => {
                      toggle(value);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="h-5 w-5 rounded"
                  />
                  <span className="font-sm text-black">{label}</span>
                </div>
                {checked && (
                  <svg
                    className="h-5 w-5 text-black"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="border-t border-gray-100 px-4 py-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={handleClear}
            disabled={tempSelected.length === 0}
            className="flex-1 rounded-lg bg-gray-50 px-4 py-2.5 font-semibold text-black shadow-md transition-all disabled:cursor-not-allowed disabled:shadow-none disabled:bg-white disabled:text-gray-500">
            {intl.formatMessage({ id: 'IntegrationFilterModal.clearBtn' })}
          </Button>
          <Button
            type="button"
            disabled={isApplyDisabled}
            onClick={handleSubmit}
            className="flex-1 rounded-lg bg-black px-4 py-2.5 font-semibold text-white shadow-md transition-all hover:bg-gray-800 hover:shadow-lg disabled:cursor-not-allowed disabled:shadow-none">
            {intl.formatMessage({
              id: 'FilterPartnerOrderForm.submitButtonText',
            })}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RatingFilter;
