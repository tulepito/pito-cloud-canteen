import { useState } from 'react';
import {
  PiBuilding,
  PiFileText,
  PiHeadphones,
  PiLaptop,
  PiUser,
} from 'react-icons/pi';
import clsx from 'clsx';
import Image from 'next/image';

import featureImage from '../../assets/employee/employee-hero.webp';

const Smart = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const steps = [
    {
      title: 'Schedule meals for the whole week in just a few minutes.',
      color: '#C5D475',
      textColor: '#96A546',

      image: featureImage,
      icon: <PiHeadphones />,
    },
    {
      title:
        'Employees choose their own meals – no Admin micro-managing orders.',
      color: '#C4ECFB',
      textColor: '#3598BF',

      image: featureImage,
      icon: <PiLaptop />,
    },
    {
      title: 'On-time delivery, flexible invoicing.',

      color: '#FBD7E7',
      textColor: '#D680A3',
      image: featureImage,
      icon: <PiBuilding />,
    },
    {
      title:
        'Transparent cost reports by team and department on a single dashboard.',
      color: '#FFC811',
      textColor: '#C79000',
      image: featureImage,
      icon: <PiFileText />,
    },
    {
      title: 'Automated reminders, real-time feedback – no manual messaging.',
      color: '#C4ECFB',
      textColor: '#3598BF',
      image: featureImage,
      icon: <PiUser />,
    },
  ];

  return (
    <div className="flex flex-col w-full gap-8 md:gap-20 relative md:mb-36 mb-20 max-w-[1024px] mx-auto px-5 md:px-0">
      {/* main hero section */}
      <div className="flex flex-col items-center text-center md:gap-5 gap-2 w-full pt-0">
        <span className=" font-medium">
          Optimize operations and elevate your company&apos;s lunch experience.
        </span>
        <p className="font-semibold text-3xl md:text-[42px] font-[unbounded] md:leading-tight md:whitespace-pre-line">
          PITO Cloud Canteen{' '}
          <span className="text-[#D680A3]">Smart Operations</span>{' '}
          <br className="hidden md:block" /> Solution for{' '}
          <span className="text-[#D680A3]">Startups</span>
        </p>
      </div>

      <div className="flex md:flex-row flex-col gap-4  w-full">
        <div className="md:w-1/2 relative hidden md:flex items-center justify-center rounded-2xl overflow-hidden">
          <Image
            src={featureImage}
            alt="stepBg"
            fill
            className="object-cover"
          />
        </div>

        <div className="flex md:w-1/2 flex-col gap-[10px]">
          {steps.map((step, index) => (
            <div className="flex flex-col gap-4 w-full" key={index}>
              <div
                className="border rounded-2xl md:rounded-[30px] overflow-hidden"
                style={{
                  borderColor: activeIndex === index ? step.color : '#D7D7D7',
                }}>
                <button
                  onClick={() => setActiveIndex(index)}
                  className={`flex w-full items-start gap-3 md:gap-4 transition-all duration-200 px-3 py-4 md:p-5 hover:bg-[#eff1f2]`}
                  style={{
                    backgroundColor:
                      activeIndex === index ? step.color : 'transparent',
                  }}>
                  <div
                    className={clsx(
                      'size-8 md:size-11 text-lg md:text-xl flex items-center justify-center shrink-0 rounded-full',
                      `text-[${step.textColor}]`,
                    )}
                    style={{
                      backgroundColor:
                        activeIndex === index ? 'white' : step.color,
                    }}>
                    {step.icon}
                  </div>

                  <span className="text-base md:text-lg text-left font-medium">
                    {step.title}
                  </span>
                </button>
              </div>
              {activeIndex === index && (
                <div className="w-full relative aspect-[41/50] flex items-center justify-center rounded-2xl overflow-hidden md:hidden">
                  <Image
                    src={featureImage}
                    alt="stepBg"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Smart;
