import React from 'react';
import { PiClock, PiForkKnife, PiUser } from 'react-icons/pi';
import clsx from 'clsx';
import Image from 'next/image';

import { useModal } from '@pages/website/pages/Layout';

import image from '../../assets/employee/employee-hero.webp';

const data = [
  {
    title: 'Delivered on time, well-presented, and nutritionally balanced',
    color: '#C5D475',
    textColor: '#96A546',
    icon: <PiClock />,
  },
  {
    title: 'Choose all your meals for the week in one go',
    color: '#C4ECFB',
    textColor: '#3598BF',
    icon: <PiForkKnife />,
  },
  {
    title: 'Personalized lunchbox with your name and meal inside',
    color: '#FBD7E7',
    textColor: '#D680A3',
    icon: <PiUser />,
  },
];

const Experience = () => {
  const { setIsModalOpen } = useModal();

  return (
    <div className="flex flex-col w-full gap-8 md:gap-20 relative md:mb-36 mb-20 max-w-[1024px] mx-auto px-5 md:px-0">
      {/* main hero section */}
      <div className="flex flex-col items-center text-center md:gap-5 gap-2 w-full pt-0">
        <p className="font-semibold text-3xl md:text-[42px] font-[unbounded] md:leading-tight md:whitespace-pre-line">
          Your Experience with <br className="hidden md:block" /> PITO Cloud
          Canteen
        </p>
        <a
          href=""
          onClick={(e) => {
            e.preventDefault();
            setIsModalOpen(true);
          }}
          className="capitalize btn border font-[unbounded] border-gray-300 bg-black text-white py-3 px-6 font-semibold hover:opacity-90 transition-all duration-200 hover:scale-[1.01] hidden md:block">
          Explore the Experience
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
        <div className="col-span-1 ">
          <div className="relative w-full aspect-[164/175] md:aspect-[3/2] rounded-[20px] overflow-hidden">
            <Image
              src={image}
              alt="Experience Image"
              fill
              className="object-cover"
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

      <a
        href=""
        onClick={(e) => {
          e.preventDefault();
          setIsModalOpen(true);
        }}
        className="capitalize btn border font-[unbounded] border-gray-300 bg-black text-white py-3 px-6 font-semibold hover:opacity-90 transition-all duration-200 hover:scale-[1.01] block md:hidden">
        Explore the Experience
      </a>
    </div>
  );
};

export default Experience;
