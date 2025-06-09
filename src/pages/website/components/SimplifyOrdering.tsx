import { useState } from 'react';
import { useIntl } from 'react-intl';
import Image from 'next/image';

import stepBg from '../assets/stepBg.svg';

import VideoSection from './VideoSection';

const SimplifyOrdering = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const intl = useIntl();

  const steps = [
    {
      step: intl.formatMessage({
        id: 'menus-are-auto-generated-adjustable-anytime',
      }),
      image: '7za7iibhgy',
    },
    {
      step: intl.formatMessage({
        id: 'choose-meals-for-the-whole-week-with-just-a-few-clicks',
      }),
      image: '8u3jxgesk7',
    },
    {
      step: intl.formatMessage({
        id: 'meals-delivered-directly-to-your-desk-no-need-to-pick-up',
      }),
      image: 'tpn0y59zt5',
    },
  ];

  return (
    <div className="pt-20 px-5 flex md:flex-row-reverse flex-col gap-4 md:px-0 md:pb-20 max-w-[1024px] mx-auto">
      <div className="md:w-1/2 relative flex items-center justify-center rounded-2xl overflow-hidden">
        <Image
          src={stepBg}
          alt="stepBg"
          className="size-full object-cover absolute -z-10"
        />
        <VideoSection
          embedUrl={`https://fast.wistia.net/embed/iframe/${steps[activeIndex].image}?autoPlay=true&mute=true&playerColor=000000`}
          className="w-[95%]"
        />
      </div>

      <div className="flex flex-col gap-8 flex-1">
        <span className="font-alt font-bold text-2xl md:text-start text-center md:text-[42px] md:leading-tight md:whitespace-pre-line">
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
