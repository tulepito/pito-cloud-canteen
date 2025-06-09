import { useState } from 'react';
import Image from 'next/image';

import Step1Image from '../../assets/howItWorks1.png';
import Step2Image from '../../assets/howItWorks2.png';
import Step3Image from '../../assets/howItWorks3.png';

const HowItWorksDynamicCard = () => {
  const [activeCard, setActiveCard] = useState<number>(0);

  const cards = [
    {
      number: '01',
      title: 'Plan Weeklky',
      description:
        'Select restaurants and rotate the menu each day of the week. The system handles the rest automatically.',
      image: Step1Image,
    },
    {
      number: '02',
      title: 'Employees Select Their Meals',
      description:
        'Each person logs in and selects their meal based on preferences. The meal is customized for each employee.',
      image: Step2Image,
    },
    {
      number: '03',
      title: 'On-Site Setup & Service',
      description:
        'Employees scan a code to pick up their meal from the setup lunch area managed by PITO staff.',
      image: Step3Image,
    },
  ];

  return (
    <div className="flex flex-col items-center md:gap-12 md:px-0 px-5 md:pb-36 md:pt-20 pt-20 gap-10 relative max-w-[1024px] mx-auto">
      <span className="font-alt text-2xl md:text-4xl font-bold md:w-1/2 text-center md:leading-[3rem]">
        How It Works
      </span>
      <div className="flex md:flex-row flex-col md:items-stretch w-full gap-3">
        {cards.map((card, index) => {
          const isActive = activeCard === index;

          return (
            <div
              key={index}
              className={`transition-all duration-300 ease-in-out flex flex-col overflow-hidden gap-5 justify-between rounded-3xl cursor-pointer p-4 ${
                isActive
                  ? 'md:w-1/2 w-full bg-[#6CCFF6]/60'
                  : 'md:w-1/4 w-full bg-[#F0F4F5]'
              }`}
              onClick={() => setActiveCard(index)}>
              <figure
                key={index}
                onClick={() => setActiveCard(index === activeCard ? 0 : index)}>
                <figcaption
                  className={`z-50 rounded-xl transition-all duration-300 ease-in-out ${
                    isActive
                      ? 'text-[#3598BF]  bg-[#b7e2f9]'
                      : 'text-[#A8A8A8] bg-[#F0F4F5]'
                  } `}>
                  <div
                    className={`px-2.5 py-4 rounded-xl flex items-center justify-center bg-white w-fit font-semibold text-lg `}>
                    {card.number}
                  </div>
                </figcaption>
                <div
                  className={`clip w-full bg-white flex justify-end ${
                    isActive ? 'scale-100 h-56' : 'scale-0 h-0'
                  }`}>
                  <Image
                    className="w-full -mr-16 h-full object-cover object-top-left"
                    src={card.image}
                    alt={card.title}
                  />
                </div>
              </figure>
              <div className="flex flex-col gap-1">
                <span className="font-semibold">{card.title}</span>
                <span
                  className={`text-sm transition-all duration-300 ease-in-out ${
                    isActive
                      ? 'scale-100 h-auto opacity-100'
                      : 'scale-0 h-0 opacity-0'
                  }`}>
                  {card.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HowItWorksDynamicCard;
