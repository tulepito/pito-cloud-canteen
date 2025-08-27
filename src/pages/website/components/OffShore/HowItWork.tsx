import React from 'react';
import Image from 'next/image';

import blue from '../../assets/decorations/blue.svg';
import lemon from '../../assets/decorations/lemon.svg';
import pink from '../../assets/decorations/pink.svg';
import yellow from '../../assets/decorations/yellow.svg';
import yellowTriangle from '../../assets/decorations/yellowTriangle.svg';
import image from '../../assets/offshore/how-it-work.webp';

const HowItWorks = () => {
  return (
    <div className="flex flex-col w-full gap-8 md:gap-20 relative md:mb-32 mb-20 max-w-[1024px] mx-auto px-5 md:px-0">
      {/* main hero section */}

      <div className="flex flex-col md:items-start items-center md:text-left text-center md:gap-5 gap-2 md:w-2/3 pt-0">
        <span className="font-semibold font-[unbounded] text-2xl md:text-[40px] leading-tight text-center">
          How It Works <br className="hidden md:block" />{' '}
          <span className="text-[#D680A3]">3 easy steps</span>
        </span>
        <span className="text-text md:text-lg md:whitespace-pre-line font-medium">
          Transform Your Lunch Experience in Just 3 Steps
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 items-center w-full md:gap-y-[160px] gap-10 md:gap-x-[60px]">
        <div className="order-1 md:order-none col-span-1 flex flex-col gap-1 md:gap-5 justify-center ">
          <div className="flex flex-col gap-4 md:gap-5 items-center md:items-start">
            <div
              className="
            md:size-[100px] size-12 flex items-center justify-center rounded-full bg-[#6CCFF6] md:text-4xl text-base text-white font-semibold">
              01
            </div>
            <span className="text-[20px] md:text-[50px] text-left font-bold">
              Set Your Weekly Meal Plan
            </span>
          </div>
          <p className="text-base md:text-[22px] font-normal   text-center md:text-left">
            Choose daily vendors. Schedule by team, shift, or location.
          </p>
        </div>
        <div className="order-2 md:order-none col-span-1 relative w-full aspect-[4/3] flex items-center">
          <Image
            src={image}
            alt="How It Works Step 1"
            fill
            className="rounded-[20px] object-cover"
          />
          <div className="aspect-[247/285] w-[60%] top-[5%] -left-[15%] absolute -z-20">
            <Image src={pink} alt="pink triangle decor" fill />
          </div>
          <div className="aspect-[245/240] w-[40%] -bottom-[10%] md:-bottom-[20%] -right-[12%] absolute -z-20 -rotate-[148deg]">
            <Image src={yellowTriangle} alt="pink triangle decor" fill />
          </div>
        </div>

        <div className="order-4 md:order-none col-span-1 relative w-full aspect-[4/3] flex items-center">
          <Image
            src={image}
            alt="How It Works Step 2"
            fill
            className="rounded-[20px] object-cover"
          />
          <div className="aspect-[35/26] w-[80%] -bottom-[20%] -left-[36%] absolute -z-10 -rotate-[20deg]">
            <Image src={blue} alt="hero" className="object-contain" fill />
          </div>
          <div className="aspect-square w-[60px] md:w-[120px] -top-[10%] md:-top-[16%] -left-[10%] md:-left-[12%] absolute -z-20">
            <Image src={yellow} alt="pink triangle decor" fill />
          </div>
        </div>
        <div className="order-3 md:order-none col-span-1 flex flex-col gap-1 md:gap-5 justify-center ">
          <div className="flex flex-col gap-4 md:gap-5 items-center md:items-start">
            <div
              className="
            md:size-[100px] size-12 flex items-center justify-center rounded-full bg-[#C5D475] md:text-4xl text-base text-white font-semibold">
              02
            </div>
            <span className="text-[20px] md:text-[50px] text-left font-bold">
              Employees Pick Meals via App
            </span>
          </div>
          <p className="text-base md:text-[22px] font-normal   text-center md:text-left">
            No spam. No manual tracking. Dietary preferences supported.
          </p>
        </div>

        <div className="order-5 md:order-none col-span-1 flex flex-col gap-1 md:gap-5 justify-center ">
          <div className="flex flex-col gap-4 md:gap-5 items-center md:items-start">
            <div
              className="
            md:size-[100px] size-12 flex items-center justify-center rounded-full bg-[#F6AFCE] md:text-4xl text-base text-white font-semibold">
              03
            </div>
            <span className="text-[20px] md:text-[50px] text-left font-bold">
              PITO Handles the Rest
            </span>
          </div>
          <p className="text-base md:text-[22px] font-normal   text-center md:text-left">
            On-time delivery. Real-time tracking. Live feedback.
          </p>
        </div>
        <div className="order-6 md:order-none col-span-1 relative w-full aspect-[4/3]">
          <Image
            src={image}
            alt="How It Works Step 3"
            fill
            className="rounded-[20px] object-cover"
          />
          <div className="aspect-[247/285] w-[60%] -top-[30%] md:-top-[36%] -right-[15%] absolute -z-20 rotate-[92deg]">
            <Image src={pink} alt="pink triangle decor" fill />
          </div>
          <div className="aspect-[245/240] w-[40%] -bottom-[10%] -left-[12%] absolute -z-20 -rotate-[194deg]">
            <Image src={lemon} alt="pink triangle decor" fill />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
