import { useState } from 'react';
import { PiMinusBold, PiPlusBold } from 'react-icons/pi';
import { useIntl } from 'react-intl';
import type { StaticImageData } from 'next/image';
import Image from 'next/image';

import img0 from '../assets/why.webp';
import img1 from '../assets/why2.webp';
import img2 from '../assets/why3.webp';

interface FAQ {
  question: string;
  answer: string[];
  image: StaticImageData;
}

const WhyChooseUs = () => {
  const intl = useIntl();
  const [activeIndex, setActiveIndex] = useState<number>(0); // Open first by default

  const faqs: FAQ[] = [
    {
      question: intl.formatMessage({ id: 'tech-first-meal-management' }),
      answer: [
        intl.formatMessage({
          id: 'automated-weekly-scheduling-for-unpredictable-workloads',
        }),
        intl.formatMessage({ id: 'no-disruption-to-your-existing-processes' }),
        intl.formatMessage({
          id: 'real-time-usage-tracking-and-budget-control',
        }),
      ],
      image: img0,
    },
    {
      question: intl.formatMessage({ id: 'total-visibility-zero-hassle' }),
      answer: [
        intl.formatMessage({ id: 'yes-pito-is-flexible-for-any-team-setup' }),
        intl.formatMessage({
          id: 'supports-meal-credits-and-individual-preferences',
        }),
        intl.formatMessage({
          id: 'smart-reminders-and-autopilot-meal-plans',
        }),
      ],
      image: img1,
    },
    {
      question: intl.formatMessage({ id: 'built-for-scale-and-flexibility' }),
      answer: [
        intl.formatMessage({ id: 'setup-takes-less-than-a-day' }),
        intl.formatMessage({ id: 'dedicated-onboarding-support-is-available' }),
        intl.formatMessage({
          id: 'no-kitchen-required-no-long-term-vendor-contracts',
        }),
      ],
      image: img2,
    },
  ];

  const toggleFAQ = (index: number) => {
    setActiveIndex((prevIndex) => (prevIndex === index ? 0 : index));
  };

  return (
    <div className="pt-16 flex md:flex-row flex-col-reverse gap-10 md:px-0 md:pb-16 max-w-[1024px] mx-auto">
      <div className="md:w-1/2">
        <Image
          src={faqs[activeIndex].image}
          className="rounded-2xl object-contain bg-sky-200 w-full h-auto"
          alt={`FAQ visual ${activeIndex}`}
          priority
        />
      </div>

      <div className="flex flex-col gap-8 flex-1">
        <span className="font-alt font-bold text-2xl md:text-[42px] md:leading-[3rem] md:whitespace-pre-line">
          {intl.formatMessage({ id: 'why-tech-leaders-choose-pito' })}
        </span>

        <div className="flex flex-col divide-y divide-gray-200">
          {faqs.map((faq, index) => {
            const isOpen = activeIndex === index;

            return (
              <div key={index} className="py-4">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left text-xl flex justify-between items-center font-semibold text-black focus:outline-none cursor-pointer">
                  {faq.question}
                  <span className="text-[#A8A8A8] text-xl">
                    {isOpen ? <PiMinusBold /> : <PiPlusBold />}
                  </span>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-40 mt-4' : 'max-h-0'
                  }`}>
                  <div className="text-sm flex flex-col gap-3">
                    {faq.answer.map((line, idx) => (
                      <div key={idx} className="flex gap-2">
                        <div className="size-3 shrink-0 mt-1 rounded-sm bg-[#C5D475]"></div>
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WhyChooseUs;
