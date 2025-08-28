import React, { useMemo } from 'react';
import { CgClose } from 'react-icons/cg';
import {
  PiBellRinging,
  PiClock,
  PiForkKnife,
  PiHandshake,
  PiUser,
} from 'react-icons/pi';
import { useIntl } from 'react-intl';
import Image from 'next/image';

import blue from '../../assets/decorations/blue.svg';
import blue2 from '../../assets/decorations/blue2.svg';
import pink from '../../assets/decorations/pink.svg';
import yellow from '../../assets/decorations/yellow.svg';
import differenceImage from '../../assets/tech/stability.webp';
import differenceImage1 from '../../assets/tech/stability1.webp';

const Stability = () => {
  const intl = useIntl();

  const data1 = useMemo(() => {
    return [
      intl.formatMessage({
        id: 'hr-admin-spending-hours-each-week-on-lunch-orders',
      }),
      intl.formatMessage({ id: 'late-deliveries-disrupt-meals-and-work' }),
      intl.formatMessage({
        id: 'manual-management-via-chat-apps-excel-and-spreadsheets',
      }),
      intl.formatMessage({ id: 'frustrated-employees-lower-productivity' }),
    ];
  }, [intl]);

  const data2 = useMemo(() => {
    return [
      {
        icon: <PiForkKnife />,
        title: intl.formatMessage({
          id: 'pre-plan-weekly-meals-automatically-on-the-system',
        }),
      },
      {
        icon: <PiUser />,
        title: intl.formatMessage({
          id: 'allow-employees-to-choose-meals-based-on-taste-and-dietary-needs',
        }),
      },
      {
        icon: <PiClock />,
        title: intl.formatMessage({
          id: 'ensure-on-time-fully-contactless-delivery',
        }),
      },
      {
        icon: <PiHandshake />,
        title: intl.formatMessage({
          id: 'track-costs-by-project-team-or-department-in-real-time',
        }),
      },
      {
        icon: <PiBellRinging />,
        title: intl.formatMessage({
          id: 'send-automated-reminders-for-employees-to-manage-their-meals',
        }),
      },
    ];
  }, [intl]);

  return (
    <div className="flex flex-col w-full gap-8 md:gap-20 relative md:mb-36 mb-20 max-w-[1024px] mx-auto px-5 md:px-0">
      <h2 className="font-alt text-center font-semibold font-[unbounded] text-2xl md:text-[40px] leading-tight md:whitespace-pre-line">
        {intl.formatMessage(
          {
            id: 'pito-cloud-canteen-stable-lunch-higher-productivity',
          },
          {
            highlightEn: <span className="text-[#D680A3]">Stable Lunch</span>,
            highlightVi: (
              <span className="text-[#D680A3]">Ổn định bữa trưa</span>
            ),
            highlightEn1: (
              <span className="text-[#D680A3]">Higher Productivity</span>
            ),
            highlightVi1: (
              <span className="text-[#D680A3]">Tăng hiệu suất</span>
            ),
          },
        )}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-[60px]">
        <div className="flex flex-col gap-3 md:gap-6 w-full">
          <p className="text-[20px] md:text-4xl font-semibold text-center md:text-left">
            {intl.formatMessage({ id: 'when-logistics-fail-lunch-suffers' })}
          </p>
          <div className="flex flex-col items-end gap-2 w-full">
            {data1.map((item, index) => (
              <div
                key={index}
                className="w-full flex items-center gap-3 border border-[#D7D7D7] rounded-2xl py-4 px-3 md:p-5">
                <div className="size-8 md:size-11 text-lg md:text-xl shrink-0 rounded-full flex items-center justify-center bg-[#F0F4F5] text-[#A8A8A8]">
                  <CgClose />
                </div>
                <span className="text-base md:text-lg text-left font-normal md:font-medium md:h-[56px] flex items-center">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col col-span-1">
          <div className="relative aspect-[41/50] md:aspect-[291/265] h-full rounded-2xl overflow-hidden">
            <Image
              src={differenceImage}
              alt="Traditional Lunch Provider"
              fill
              className="object-cover"
            />
            <Image
              src={yellow}
              className="absolute size-20 top-[16%] -right-[40%] -z-10"
              alt="yellow circle decor"
            />
            <div className="aspect-[247/285] w-[100%] -top-[8%] -right-[46%] absolute -z-20 -rotate-[22deg]">
              <Image src={blue} alt="pink triangle decor" fill />
            </div>
          </div>
        </div>
        <div className="flex flex-col order-2 md:order-1 col-span-1">
          <div className="relative aspect-[41/50] md:aspect-[291/316] h-full rounded-2xl overflow-hidden">
            <Image
              src={differenceImage1}
              alt="Traditional Lunch Provider"
              fill
              className="object-cover"
            />
            <div className="aspect-[247/285] w-[35%] top-[18%] -left-[50%] absolute -z-10 -rotate-[22deg]">
              <Image src={blue2} alt="pink triangle decor" fill />
            </div>
            <div className="aspect-[247/285] w-[90%] top-[5%] -left-[50%] absolute -z-20 -rotate-[180deg]">
              <Image src={pink} alt="pink triangle decor" fill />
            </div>
            <Image
              src={yellow}
              className="absolute size-[60px] bottom-[10%] -left-[40%] -z-10"
              alt="yellow circle decor"
            />
          </div>
        </div>
        <div className="flex flex-col order-1 md:order-2 col-span-1 gap-3 md:gap-6 w-full mt-4 md:mt-0">
          <p className="text-[20px] md:text-4xl font-semibold text-center md:text-left">
            {intl.formatMessage({ id: 'pito-cloud-canteen-helps-you' })}
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
  );
};

export default Stability;
