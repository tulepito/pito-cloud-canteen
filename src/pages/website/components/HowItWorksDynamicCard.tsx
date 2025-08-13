import { useState } from 'react';
import { useIntl } from 'react-intl';
import Image from 'next/image';

import Step1Image from '../assets/len-ke-hoach-mot-lan-khong-can-dat-moi-ngay.webp';
import Step3Image from '../assets/meal-box-delivery.webp';
import Step2Image from '../assets/nhan-vien-tu-chon-mon.webp';

import GoogleCalendarModal from './GoogleCalendarModal';

const HowItWorksDynamicCard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCard, setActiveCard] = useState<number>(0);
  const intl = useIntl();

  const cards = [
    {
      number: '01',
      title: intl.formatMessage({ id: 'plan-once-set-and-forget' }),
      description: intl.formatMessage({
        id: 'the-booker-your-teams-meal-coordinator-selects-the-vendors-and-weekly-menu-no-more-daily-decisions-or-zalo-messages',
      }),
      image: Step1Image,
    },
    {
      number: '02',
      title: intl.formatMessage({ id: 'let-your-team-choose' }),
      description: intl.formatMessage({
        id: 'employees-receive-app-notifications-to-pre-select-their-meals-just-one-tap-and-the-whole-weeks-menu-is-set',
      }),
      image: Step2Image,
    },
    {
      number: '03',
      title: intl.formatMessage({ id: 'meals-delivered-where-you-want' }),
      description: intl.formatMessage({
        id: 'no-calls-no-confusion-our-delivery-agents-team-sets-up-meals-at-the-designated-drop-off-point-all-fully-contactless',
      }),
      image: Step3Image,
    },
  ];

  return (
    <div className="flex flex-col items-center md:gap-12 md:px-0 px-5 md:pb-20 pt-16 md:pt-16 gap-10 relative max-w-[1024px] mx-auto">
      <h2 className="font-[unbounded] text-2xl md:text-[40px] font-bold md:w-2/3 text-center md:leading-tight md:whitespace-pre-line">
        {intl.formatMessage({ id: 'mo-hinh-hoat-dong' })}
      </h2>
      <div className="flex md:flex-row flex-col md:items-stretch w-full gap-3">
        {cards.map((card, index) => {
          const isActive = activeCard === index;

          return (
            <div
              key={index}
              className={`transition-all duration-300 ease-in-out flex flex-col overflow-hidden gap-5 justify-between rounded-3xl cursor-pointer p-4 ${
                isActive
                  ? 'md:w-1/2 w-full bg-[#6CCFF6]/60 '
                  : 'md:w-1/4 w-full bg-[#F0F4F5] hover:bg-[#6CCFF6CC]/80'
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
                <h3 className="font-semibold">{card.title}</h3>
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
      <a
        href=""
        onClick={(e) => {
          e.preventDefault();
          setIsModalOpen(true);
        }}
        className="btn border font-[unbounded] font-medium border-solid border-black text-black hover:bg-black hover:text-white md:w-fit w-full">
        {intl.formatMessage({ id: 'dat-lich-demo-mien-phi' })}
      </a>
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex justify-center items-center bg-black/20">
          <GoogleCalendarModal
            isModalOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

export default HowItWorksDynamicCard;
