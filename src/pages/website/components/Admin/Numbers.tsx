import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';
import clsx from 'clsx';

const Numbers = () => {
  const intl = useIntl();

  const numbersData = useMemo(() => {
    return [
      {
        title: '80%',
        color: '#3598BF',
        description: intl.formatMessage({ id: 'less-time-managing-lunches' }),
      },
      {
        title: '100%',
        color: '#D680A3',
        description: intl.formatMessage({ id: 'on-time-delivery-rate' }),
      },
      {
        title: '90%',
        color: '#96A546',
        description: intl.formatMessage({
          id: 'employee-meal-satisfaction-score',
        }),
      },
    ];
  }, [intl]);

  return (
    <div className="flex flex-col w-full gap-8 md:gap-20 relative md:mb-36 mb-20 max-w-[1280px] mx-auto px-5 md:px-0">
      {/* main hero section */}
      <div className="flex flex-col items-center md:gap-4 gap-3 text-center w-full">
        <h2 className="font-alt font-semibold font-[unbounded] text-2xl md:text-[40px] leading-tight">
          {intl.formatMessage({ id: 'numbers-that-speak-for-themselves' })}
        </h2>
        <span className="text-text md:text-lg md:whitespace-pre-line font-medium">
          {intl.formatMessage({
            id: 'pito-cloud-canteen-helps-your-company-save-time-streamline-operations-and-boost-employee-satisfaction',
          })}
        </span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center w-full h-full gap-8">
        {numbersData.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center md:items-start justify-start gap-2 w-full">
            <span
              className={clsx(
                'text-[28px] md:text-[80px] leading-tight font-bold',
                `text-[${item.color}]`,
              )}>
              {item.title}
            </span>
            <span className="text-text md:text-2xl font-normal">
              {item.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Numbers;
