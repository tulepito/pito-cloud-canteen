import { useState } from 'react';
import { useIntl } from 'react-intl';
import Image from 'next/image';

import img0 from '../assets/step1.gif';
import img1 from '../assets/step2.gif';
import img2 from '../assets/step3.gif';
import stepBg from '../assets/stepBg.svg';

const steps = [
  {
    step: 'Menus are auto-generated, adjustable anytime',
    image: img0,
  },
  {
    step: 'Choose meals for the whole week with just a few clicks.',
    image: img1,
  },
  {
    step: 'Meals delivered directly to your desk, no need to pick up.',
    image: img2,
  },
];

const SimplifyOrdering = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const intl = useIntl();

  return (
    <div className="pt-20 px-5 flex md:flex-row-reverse flex-col gap-4 md:px-52 md:pb-36 max-w-[1224px] mx-auto">
      <div className="md:w-1/2 relative flex items-center justify-center rounded-2xl overflow-hidden">
        <Image
          src={stepBg}
          alt="stepBg"
          className="size-full object-cover absolute -z-10"
        />
        <Image
          src={steps[activeIndex].image}
          className="object-cover  w-[95%] h-[42%] rounded-2xl overflow-hidden"
          alt={`Step visual ${activeIndex}`}
        />
      </div>

      <div className="flex flex-col gap-8 flex-1">
        <span className="font-alt font-bold text-2xl md:text-start text-center md:text-4xl md:leading-[3rem]">
          {intl.formatMessage({ id: 'simplify-the-process-of-ordering-lunch' })}
        </span>

        <div className="flex flex-col">
          {steps.map((step, index) => (
            <div key={index} className="py-2.5">
              <button
                onClick={() =>
                  setActiveIndex(index === activeIndex ? 0 : index)
                }
                className={`w-full text-left text-lg flex gap-2 border border-solid border-[#C5D475] transition-all duration-300 ease-in-out rounded-2xl p-4 pr-8 cursor-pointer ${
                  activeIndex === index ? 'bg-[#C5D475]' : 'bg-white'
                }`}>
                <div
                  className={`size-3 shrink-0 mt-2 rounded-sm transition-all duration-300 ease-in-out
                  ${activeIndex === index ? 'bg-[#96A546]' : 'bg-[#C5D475]'}
                  `}></div>
                {step.step}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimplifyOrdering;
