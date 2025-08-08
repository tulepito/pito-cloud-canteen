import React from 'react';
import Image from 'next/image';

import image1 from '../../assets/startup/work1.webp';
import image2 from '../../assets/startup/work2.webp';
import image3 from '../../assets/startup/work3.webp';

const HowItWorks = () => {
  return (
    <div className="flex flex-col w-full gap-8 md:gap-20 relative md:my-36 my-20 max-w-[1024px] mx-auto px-5 md:px-0">
      {/* main hero section */}
      <span className="font-alt font-semibold font-[unbounded] text-2xl md:text-[40px] leading-tight">
        How It Works
      </span>
      <div className="flex flex-col items-center w-full gap-8 md:gap-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-[60px]">
          <div className="order-2 md:order-1 col-span-1 flex flex-col gap-[10px] md:gap-5 justify-center">
            <div className="flex flex-col gap-2 md:gap-5 items-start">
              <div
                className="
            md:size-[100px] size-11 flex items-center justify-center rounded-full bg-[#6CCFF6] md:text-4xl text-base text-white font-semibold">
                01
              </div>
              <span className="text-[20px] md:text-[28px] text-left font-bold">
                Set up your meal schedule and automatically select menus for the
                whole week
              </span>
            </div>
            <p className="text-base md:text-[22px] font-normal  ">
              Admin/Booker chooses from 100+ partner restaurants on the system.
              One restaurant per day.
            </p>
          </div>
          <div className="order-1 md:order-2 grid-cols-1 relative w-full aspect-[12/7]">
            <Image
              src={image1}
              alt="How It Works Step 1"
              fill
              className="rounded-[20px] object-cover"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-[60px]">
          <div className="grid-cols-1 relative w-full aspect-[12/7]">
            <Image
              src={image3}
              alt="How It Works Step 2"
              fill
              className="rounded-[20px] object-cover"
            />
          </div>
          <div className="col-span-1 flex flex-col gap-3 md:gap-5 justify-center">
            <div className="flex flex-col gap-2 md:gap-5 items-start">
              <div
                className="
            md:size-[100px] size-11 flex items-center justify-center rounded-full bg-[#C5D475] md:text-4xl text-base text-white font-semibold">
                02
              </div>
              <span className="text-[20px] md:text-[28px] text-left font-bold">
                Employees choose their favorite dishes with just a few clicks
              </span>
            </div>
            <p className="text-base md:text-[22px] font-normal  ">
              Employees select meals via app/web. Dietary preferences and
              allergies are automatically suggested.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-[60px]">
          <div className="order-3 md:order-1 col-span-1 flex flex-col gap-3 md:gap-5 justify-center">
            <div className="flex flex-col gap-2 md:gap-5 items-start">
              <div
                className="
            md:size-[100px] size-11 flex items-center justify-center rounded-full bg-[#F6AFCE] md:text-4xl text-base text-white font-semibold">
                03
              </div>
              <span className="text-[20px] md:text-[28px] text-left font-bold">
                Meals Delivered Where You Want
              </span>
            </div>
            <p className="text-base md:text-[22px] font-normal  ">
              No calls, no confusion. Our Delivery Agents team sets up meals at
              the designated drop-off point — fully contactless.
            </p>
          </div>
          <div className="order-1 md:order-2 col-span-1 relative w-full aspect-[12/7]">
            <Image
              src={image2}
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
