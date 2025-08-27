import React, { useMemo } from 'react';
import { CgClose } from 'react-icons/cg';
import { useIntl } from 'react-intl';
import Image from 'next/image';

import image1 from '../../assets/startup/what1.webp';
import image2 from '../../assets/startup/what2.webp';
import image3 from '../../assets/startup/what3.webp';
import image4 from '../../assets/startup/what4.webp';

const What = () => {
  const intl = useIntl();

  const data = useMemo(() => {
    return [
      {
        src: image1,
        alt: 'Image 1',
        title: intl.formatMessage({
          id: 'admin-hr-spends-several-hours-daily-collecting-orders-changing-dishes-and-handling-errors',
        }),
      },
      {
        src: image2,
        alt: 'Image 1',
        title: intl.formatMessage({
          id: 'late-deliveries-wrong-orders-ruin-employees-lunchtime-experience',
        }),
      },
      {
        src: image3,
        alt: 'Image 1',
        title: intl.formatMessage({
          id: 'no-management-tools-operations-are-handled-manually-via-zalo-and-excel',
        }),
      },
      {
        src: image4,
        alt: 'Image 1',
        title: intl.formatMessage({
          id: 'hard-to-control-budgets-lack-of-transparency-in-cost-reconciliation',
        }),
      },
    ];
  }, [intl]);

  return (
    <div className="flex flex-col w-full gap-8 md:gap-20 relative md:mb-36 mb-20 max-w-[1024px] mx-auto px-5 md:px-0">
      <div className="flex flex-col items-center text-center md:gap-5 gap-2 w-full pt-0">
        <span className=" font-medium">
          {intl.formatMessage({
            id: 'lunch-chaos-lower-efficiency',
          })}
        </span>
        <h2 className="font-semibold font-[unbounded] text-2xl md:text-[40px] leading-tight text-center">
          {intl.formatMessage(
            {
              id: 'hr-admin-burnout-caused-by-ordering-lunch',
            },
            {
              highlightVi: (
                <span className="text-[#96A546]">HR/Admin kiệt sức</span>
              ),
              highlightEn: (
                <span className="text-[#96A546]">HR/Admin Burnout</span>
              ),
            },
          )}
        </h2>
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

export default What;
