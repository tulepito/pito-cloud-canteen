import React from 'react';
import { PiCalendarCheck, PiUsersThree } from 'react-icons/pi';
import Image from 'next/image';

import image1 from '../../assets/admin/how-it-works-1.webp';
import image2 from '../../assets/admin/how-it-works-2.webp';
import image3 from '../../assets/admin/how-it-works-3.webp';

const HowItWorks = () => {
  return (
    <div className="flex flex-col w-full gap-6 md:gap-20 relative md:mb-36 mb-20 max-w-[1024px] mx-auto px-5 md:px-0">
      {/* main hero section */}
      <span className="font-alt font-semibold font-[unbounded] text-2xl md:text-[40px] leading-tight">
        How It Works
      </span>
      <div className="flex flex-col items-center w-full gap-8 md:gap-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-[60px]">
          <div className="order-2 md:order-1 col-span-1 flex flex-col gap-[10px] md:gap-5 justify-center">
            <div className="flex flex-row gap-3 md:gap-5 items-center">
              <div className="size-8 md:size-11 text-xl md:text-2xl flex items-center justify-center shrink-0 rounded-full text-[#96A546] bg-[#C5D475]/50">
                <PiCalendarCheck />
              </div>
              <span className="text-[20px] md:text-[28px]text-left font-bold">
                Plan Once, Set and Forget
              </span>
            </div>
            <p className="text-base md:text-[22px] font-normal  ">
              The Booker (your team&apos;s meal coordinator) selects the vendors
              and weekly menu — no more daily decisions or Zalo messages.
            </p>
          </div>
          <div className="order-1 md:order-2 col-span-1 relative w-full aspect-[164/175] md:aspect-[12/7]">
            <Image
              src={image1}
              alt="How It Works Step 1"
              fill
              className="rounded-[20px] object-cover"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-[60px]">
          <div className="col-span-1 relative w-full aspect-[164/175] md:aspect-[12/7]">
            <Image
              src={image2}
              alt="How It Works Step 2"
              fill
              className="rounded-[20px] object-cover"
            />
          </div>
          <div className="col-span-1 flex flex-col gap-[10px] md:gap-5 justify-center">
            <div className="flex flex-row gap-3 md:gap-5 items-center">
              <div className="size-8 md:size-11 text-xl md:text-2xl flex items-center justify-center shrink-0 rounded-full text-[#D680A3] bg-[#FBD7E7]/50">
                <PiUsersThree />
              </div>
              <span className="text-[20px] md:text-[28px] text-left font-bold">
                Let Your Team Choose
              </span>
            </div>
            <p className="text-base md:text-[22px] font-normal  ">
              Employees receive app notifications to pre-select their meals.
              Just one tap — and the whole week&apos;s menu is set.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-[60px]">
          <div className="order-2 md:order-1 col-span-1 flex flex-col gap-[10px] md:gap-5 justify-center">
            <div className="flex flex-row gap-3 md:gap-5 items-center">
              <div className="size-8 md:size-11 text-xl md:text-2xl flex items-center justify-center shrink-0 rounded-full text-[#3598BF] bg-[#C4ECFB]/50">
                <PiCalendarCheck />
              </div>
              <span className="text-[20px] md:text-[28px] text-left font-bold">
                Meals Delivered Where You Want
              </span>
            </div>
            <p className="text-base md:text-[22px] font-normal  ">
              No calls, no confusion. Our Delivery Agents team sets up meals at
              the designated drop-off point - all fully contactless.
            </p>
          </div>
          <div className="order-1 md:order-2 col-span-1 relative w-full aspect-[164/175] md:aspect-[12/7]">
            <Image
              src={image3}
              alt="How It Works Step 3"
              fill
              className="rounded-[20px] object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
