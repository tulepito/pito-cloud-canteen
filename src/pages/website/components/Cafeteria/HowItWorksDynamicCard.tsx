import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import clsx from 'clsx';
import Image from 'next/image';

import Step3Image from '../../assets/giao-va-setup-tan-noi.webp';
import Step1Image from '../../assets/len-ke-hoach-mot-lan-khong-can-dat-moi-ngay.webp';
import Step2Image from '../../assets/nhan-vien-tu-chon-mon.webp';

const HowItWorksDynamicCard = () => {
  const intl = useIntl();
  const [activeCard, setActiveCard] = useState<number>(0);

  const cards = useMemo(
    () => [
      {
        number: '01',
        title: intl.formatMessage({ id: 'plan-weekly' }),
        description: intl.formatMessage({
          id: 'select-restaurants-and-rotate-the-menu-each-day-of-the-week-the-system-handles-the-rest-automatically',
        }),
        image: Step1Image,
      },
      {
        number: '02',
        title: intl.formatMessage({ id: 'employees-select-their-meals' }),
        description: intl.formatMessage({
          id: 'each-person-logs-in-and-selects-their-meal-based-on-preferences-the-meal-is-customized-for-each-employee',
        }),
        image: Step2Image,
      },
      {
        number: '03',
        title: intl.formatMessage({ id: 'on-site-setup-and-service' }),
        description: intl.formatMessage({
          id: 'employees-scan-a-code-to-pick-up-their-meal-from-the-setup-lunch-area-managed-by-pito-staff',
        }),
        image: Step3Image,
      },
    ],
    [intl],
  );

  return (
    <div className="flex flex-col items-center md:gap-12 md:px-0 px-5 md:pb-16 md:pt-16 pt-16 gap-10 relative max-w-[1024px] mx-auto">
      <h2 className="font-[unbounded] text-2xl md:text-[40px] font-bold md:w-full text-center md:leading-tight whitespace-pre-line">
        {intl.formatMessage({ id: 'how-it-works' })}
      </h2>
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
                    className={clsx(
                      'w-full h-full object-cover object-top-left',
                      card.number === '03' ? '-mr-4' : '-mr-16',
                    )}
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
