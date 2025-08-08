import React from 'react';
import { CgClose } from 'react-icons/cg';
import { PiCalendarCheck, PiClock, PiStar, PiUsersThree } from 'react-icons/pi';
import Image from 'next/image';

import differenceImage from '../../assets/admin/difference.webp';
import differenceImage1 from '../../assets/admin/difference1.webp';
import blue from '../../assets/decorations/blue2.svg';
import pink from '../../assets/decorations/pink2.svg';
import yellow from '../../assets/decorations/yellow.svg';

const data1 = [
  'Pick meals every morning',
  'Confused boxes, wrong food',
  'Delays & confusion',
  'Staff complaints',
];

const data2 = [
  {
    icon: <PiCalendarCheck />,
    title: 'Choose once a week',
  },
  {
    icon: <PiUsersThree />,
    title: 'Personalized box, no errors',
  },
  {
    icon: <PiClock />,
    title: 'On-time, smooth delivery',
  },
  {
    icon: <PiStar />,
    title: 'Happier breaks, better mood',
  },
];

const Change = () => {
  return (
    <div className="flex flex-col w-full gap-8 md:gap-20 relative md:mb-36 mb-20 max-w-[1024px] mx-auto px-5 md:px-0">
      {/* main hero section */}
      <div className="flex flex-col items-center md:gap-4 gap-3 text-center w-full">
        <p className="font-alt font-semibold font-[unbounded] text-2xl md:text-[40px] leading-tight">
          What changes with PITO?
        </p>
        <span className="text-text md:text-lg md:whitespace-pre-line font-medium">
          Don&apos;t let daily lunch coordination drain your time and energy.
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-[70px]">
        <div className="flex flex-col col-span-1 items-start gap-8 md:gap-[50px]">
          <div className="relative w-full aspect-[577/420]">
            <Image
              src={differenceImage}
              alt="Traditional Lunch Provider"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex flex-col gap-3 md:gap-[30px] w-full">
            <p className="text-[20px] md:text-4xl font-semibold">Before PITO</p>
            <div className="flex flex-col gap-2 w-full">
              {data1.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 border border-[#D7D7D7] rounded-2xl py-4 px-3 md:p-5">
                  <div className="size-11 text-xl shrink-0 rounded-full flex items-center justify-center bg-[#F0F4F5] text-[#A8A8A8]">
                    <CgClose />
                  </div>
                  <span className="text-base md:text-lg text-left font-normal md:font-medium md:h-[56px] flex items-center">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col col-span-1 items-start gap-8 md:gap-[50px]">
          <div className="relative w-full aspect-[577/420]">
            <Image
              src={differenceImage1}
              alt="Traditional Lunch Provider"
              fill
              className="object-contain z-10"
            />
            <Image
              src={blue}
              alt="blue"
              className="object-fill size-[25%] absolute -right-[2%] bottom-[15%] z-20 -rotate-[20deg]"
            />
            <Image
              src={yellow}
              alt="yellow"
              className="object-fill size-[50%] absolute right-[2%] -top-[15%]"
            />
            <Image
              src={pink}
              alt="pink"
              className="object-fill size-[50%] absolute -left-[5%] bottom-[5%]"
            />
          </div>
          <div className="flex flex-col gap-3 md:gap-[30px] w-full">
            <p className="text-[20px] md:text-4xl font-semibold">After PITO</p>
            <div className="flex flex-col gap-2 w-full">
              {data2.map((item, index) => (
                <div
                  key={index}
                  className="border rounded-2xl overflow-hidden border-[#C5D475]">
                  <div
                    className={`flex items-center gap-3 rounded-lg transition-all duration-200 py-4 px-3 md:p-5 bg-[#C5D475] hover:bg-[#eff1f2`}>
                    <div className="size-11 text-2xl flex items-center justify-center shrink-0 rounded-full text-[#96A546] bg-white">
                      {item.icon}
                    </div>
                    <span className="text-base md:text-lg text-left font-normal md:font-medium md:h-[56px] flex items-cente">
                      {item.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Change;
