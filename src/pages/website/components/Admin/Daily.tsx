import React, { useMemo } from 'react';
import { CgClose } from 'react-icons/cg';
import { useIntl } from 'react-intl';
import Image from 'next/image';

import image1 from '../../assets/admin/image1.webp';
import image2 from '../../assets/admin/image2.webp';
import image3 from '../../assets/admin/image3.webp';
import image4 from '../../assets/admin/image4.webp';

const Daily = () => {
  const intl = useIntl();

  const data = useMemo(() => {
    return [
      {
        src: image1,
        alt: 'Image 1',
        title: intl.formatMessage({
          id: 'daily-manual-ordering-and-follow-ups',
        }),
      },
      {
        src: image2,
        alt: 'Image 1',
        title: intl.formatMessage({
          id: 'scattered-budgets-and-unclear-invoicing',
        }),
      },
      {
        src: image3,
        alt: 'Image 1',
        title: intl.formatMessage({
          id: 'employee-complaints-repeated-meals-late-delivery',
        }),
      },
      {
        src: image4,
        alt: 'Image 1',
        title: intl.formatMessage({
          id: 'operational-overload-as-team-size-scales-up',
        }),
      },
    ];
  }, [intl]);

  return (
    <div className="flex flex-col w-full gap-8 md:gap-20 relative md:mb-36 mb-20 max-w-[1024px] mx-auto px-5 md:px-0">
      {/* main hero section */}
      <div className="flex flex-col items-center md:gap-4 gap-3 text-center w-full">
        <h2 className="font-alt font-semibold font-[unbounded] text-2xl md:text-[40px] leading-tight">
          {intl.formatMessage({ id: 'admins-daily-struggles' })}
        </h2>
        <span className="text-text md:text-lg md:whitespace-pre-line font-medium">
          {intl.formatMessage({
            id: 'these-are-the-daily-struggles-most-office-admins-face-when-managing-lunch-manually',
          })}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex flex-col col-span-1 items-start gap-4 md:gap-5 w-full p-3 md:p-5 rounded-2xl md:rounded-[30px] border border-[#D7D7D7]">
            <div className="relative w-full aspect-[560/300] rounded-[20px] overflow-hidden">
              <Image src={item.src} fill alt={item.title} />
            </div>
            <div key={index} className="flex items-start gap-3 md:gap-5">
              <div className="size-9 text-xl md:text-2xl shrink-0 rounded-full flex items-center justify-center text-[#A8A8A8] bg-[#F0F4F5]">
                <CgClose />
              </div>
              <span className="text-base md:text-2xl font-medium md:font-bold">
                {item.title}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Daily;
