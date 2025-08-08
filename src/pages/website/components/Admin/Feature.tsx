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

import featureImage from '../../assets/admin/feature.webp';
import stepBg from '../../assets/stepBg.svg';

const Feature = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const steps = [
    {
      title: 'Dedicated customer success support for quick issue handling',
      color: '#C4ECFB',
      textColor: '#3598BF',
      image: featureImage,
      icon: <PiHeadphones />,
    },
    {
      title: 'Weekly auto-ordering - no daily tracking needed',
      color: '#FBD7E7',
      textColor: '#D680A3',
      image: featureImage,
      icon: <PiLaptop />,
    },
    {
      title: 'Scalable setup: manage by department or company-wide',
      color: '#C5D475',
      textColor: '#96A546',
      image: featureImage,
      icon: <PiBuilding />,
    },
    {
      title: 'Transparent reports: portions, costs, employee feedback',
      color: '#C4ECFB',
      textColor: '#3598BF',
      image: featureImage,
      icon: <PiFileText />,
    },
    {
      title: 'Employees choose their own meals → fewer complaints',
      color: '#FBD7E7',
      textColor: '#D680A3',
      image: featureImage,
      icon: <PiUser />,
    },
  ];

  return (
    <div className="px-5 flex md:flex-row-reverse flex-col gap-4 md:mb-36 mb-20 max-w-[1024px] mx-auto">
      <div className="md:w-1/2 relative flex items-center justify-center rounded-2xl overflow-hidden">
        <Image
          src={stepBg}
          alt="stepBg"
          className="size-full object-cover absolute -z-10"
        />
        <div className="w-[95%] aspect-[5/3] object-cover absolute -z-10">
          <Image
            src={steps[activeIndex].image}
            alt="stepBg"
            fill
            className="object-cover"
          />
        </div>
      </div>

      <div className="flex flex-col gap-6 md:gap-8 flex-1">
        <span className="font-alt font-semibold font-[unbounded] text-2xl md:text-[40px] leading-tight text-center md:text-left">
          Feature Highlights
        </span>

        <div className="flex flex-col gap-[10px]">
          {steps.map((step, index) => (
            <div className="flex flex-col gap-4 w-full" key={index}>
              <div
                className="border rounded-2xl md:rounded-[30px] overflow-hidden"
                style={{
                  borderColor: activeIndex === index ? step.color : '#D7D7D7',
                }}>
                <button
                  onClick={() => setActiveIndex(index)}
                  className={`flex items-start gap-3 md:gap-4 transition-all duration-200 px-3 py-4 md:p-5 hover:bg-[#eff1f2]`}
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
                    src={stepBg}
                    alt="stepBg"
                    className="size-full object-cover absolute -z-10"
                  />
                  <div className="w-[95%] aspect-[5/3] object-cover absolute -z-10">
                    <Image
                      src={steps[activeIndex].image}
                      alt="stepBg"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Feature;
