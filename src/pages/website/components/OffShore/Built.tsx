import React from 'react';
import { CgClose } from 'react-icons/cg';
import {
  PiBellRinging,
  PiCalendarCheck,
  PiFileText,
  PiForkKnife,
  PiHourglass,
} from 'react-icons/pi';
import Image from 'next/image';

import blue from '../../assets/decorations/blue2.svg';
import pink from '../../assets/decorations/pink2.svg';
import yellow from '../../assets/decorations/yellow.svg';
import differenceImage from '../../assets/offshore/built.webp';
import differenceImage1 from '../../assets/offshore/built1.webp';

const data1 = [
  'Admin/HR spends hours per week coordinating meals manually',
  'Late meals disrupt shift transitions, kill focus',
  'No central dashboard - just messages, spreadsheets, confusion',
  'Repetitive or missing meals frustrate employees',
  'Low employee satisfaction but no way to respond quickly',
];

const data2 = [
  {
    icon: <PiCalendarCheck />,
    title: 'Schedule all meals in minutes — even for rotating/off-hour teams',
  },
  {
    icon: <PiForkKnife />,
    title: 'Let each employee choose their meal & preferences (veg, halal...)',
  },
  {
    icon: <PiHourglass />,
    title: "Delivery arrives exactly where and when it's needed — every time",
  },
  {
    icon: <PiFileText />,
    title: 'Track costs per project, team, or client in real time',
  },
  {
    icon: <PiBellRinging />,
    title: 'Auto-notifications and live status — no daily reminders needed',
  },
];

const Built = () => {
  return (
    <div className="flex flex-col w-full gap-8 md:gap-20 relative md:mb-36 mb-20 max-w-[1024px] mx-auto px-5 md:px-0">
      {/* main hero section */}
      <div className="flex flex-col items-center md:gap-4 gap-3 text-center w-full">
        <span className=" font-medium">
          PITO gives you meal stability and control - across time zones and
          shifts.
        </span>
        <p className="font-alt font-semibold font-[unbounded] text-2xl md:text-[40px] leading-tight">
          Built for Offshore Ops
        </p>
        <div className="flex justify-center items-center w-full gap-2 mt-8">
          <p className="capitalize btn border font-[unbounded] border-gray-300 bg-black text-white py-3 px-6 font-semibold hover:opacity-90 transition-all duration-200 hover:scale-[1.01]">
            Schedule a Live Demo
          </p>
        </div>
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
            <p className="text-[20px] md:text-4xl font-semibold">
              Traditional Lunch Providers
            </p>
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
            <p className="text-[20px] md:text-4xl font-semibold">
              With PITO Cloud Canteen
            </p>
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

export default Built;
