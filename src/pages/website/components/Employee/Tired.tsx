import React from 'react';
import { CgClose } from 'react-icons/cg';
import Image from 'next/image';

import image1 from '../../assets/employee/tired1.webp';
import image2 from '../../assets/employee/tired2.webp';
import image3 from '../../assets/employee/tired3.webp';
import image4 from '../../assets/employee/tired4.webp';

const data = [
  {
    src: image1,
    alt: 'Image 1',
    title: 'Wasting time picking meals every morning',
  },
  {
    src: image2,
    alt: 'Image 1',
    title: 'Confusion at lunch: which box is mine?',
  },
  {
    src: image3,
    alt: 'Image 1',
    title: 'Repetitive meals that don&apos;t match your taste',
  },
  {
    src: image4,
    alt: 'Image 1',
    title: 'Food arrives late - cutting into break time',
  },
];

const Tired = () => {
  return (
    <div className="flex flex-col w-full gap-8 md:gap-20 relative md:mb-36 mb-20 max-w-[1024px] mx-auto px-5 md:px-0">
      {/* main hero section */}
      <span className="font-alt font-semibold font-[unbounded] text-2xl md:text-[40px] leading-tight text-center">
        Tired of this every lunch?
      </span>

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

export default Tired;
