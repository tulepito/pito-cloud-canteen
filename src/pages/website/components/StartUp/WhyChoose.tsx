import React from 'react';
import { PiFileText, PiStar, PiUser, PiUsersThree } from 'react-icons/pi';
import clsx from 'clsx';
import Image from 'next/image';

import { useModal } from '@pages/website/pages/Layout';

import blue from '../../assets/decorations/blue2.svg';
import pink from '../../assets/decorations/pink2.svg';
import yellow from '../../assets/decorations/yellow.svg';
import differenceImage1 from '../../assets/startup/why.webp';

const data = [
  {
    title: 'Professional operating process – no need for constant supervision.',
    color: '#C5D475',
    textColor: '#96A546',
    icon: <PiStar />,
  },
  {
    title: 'Boost work efficiency.',
    color: '#C4ECFB',
    textColor: '#3598BF',
    icon: <PiUsersThree />,
  },
  {
    title: 'Improve employee experience – easier talent retention.',
    color: '#FBD7E7',
    textColor: '#D680A3',
    icon: <PiUser />,
  },
  {
    title: 'Clear, transparent costs – optimized for Startup budgets.',
    color: '#C4ECFB',
    textColor: '#3598BF',
    icon: <PiFileText />,
  },
];

const WhyChoose = () => {
  const { setIsModalOpen } = useModal();

  return (
    <div className="flex flex-col w-full gap-8 md:gap-20 relative md:mb-36 mb-20 max-w-[1024px] mx-auto px-5 md:px-0">
      {/* main hero section */}
      <div className="flex flex-col items-center text-center md:gap-5 gap-2 w-full pt-0 mb-6 md:mb-0">
        <p className="font-semibold text-3xl md:text-[42px] font-[unbounded] md:leading-tight md:whitespace-pre-line">
          Why <span className="text-[#D680A3]">Startups Choose</span> PITO Cloud
          Canteen?
        </p>
        <a
          href=""
          onClick={(e) => {
            e.preventDefault();
            setIsModalOpen(true);
          }}
          className="capitalize btn border font-[unbounded] border-gray-300 bg-black text-white py-3 px-6 font-semibold hover:opacity-90 transition-all duration-200 hover:scale-[1.01]">
          Explore the Experience
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-1 flex items-end">
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
        </div>
        <div className="col-span-1 flex flex-col justify-between w-full gap-2 md:gap-[10px]">
          {data.map((item, index) => (
            <div
              key={index}
              className="border rounded-2xl md:rounded-[30px] overflow-hidden border-[#D7D7D7]">
              <div
                className={`flex items-start gap-3 md:gap-4 transition-all duration-200 px-3 py-4 md:p-5 hover:bg-[#eff1f2]`}>
                <div
                  className={clsx(
                    'size-8 md:size-11 text-lg md:text-xl flex items-center justify-center shrink-0 rounded-full',
                  )}
                  style={{
                    backgroundColor: item.color,
                    color: item.textColor,
                  }}>
                  {item.icon}
                </div>

                <span className="text-base md:text-lg text-left font-medium">
                  {item.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WhyChoose;
