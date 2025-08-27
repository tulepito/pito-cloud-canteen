import React, { useMemo } from 'react';
import { CgClose } from 'react-icons/cg';
import { PiCalendarCheck, PiClock, PiUsersThree } from 'react-icons/pi';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import Image from 'next/image';

import differenceImage from '../../assets/admin/difference.webp';
import differenceImage1 from '../../assets/admin/difference1.webp';
import blue from '../../assets/decorations/blue2.svg';
import pink from '../../assets/decorations/pink2.svg';
import yellow from '../../assets/decorations/yellow.svg';

const Change = () => {
  const intl = useIntl();

  const dataFirst = useMemo(() => {
    return [
      intl.formatMessage({ id: 'pick-meals-every-morning' }),
      intl.formatMessage({ id: 'confused-boxes-wrong-food' }),
      intl.formatMessage({ id: 'delays-and-confusion' }),
    ];
  }, [intl]);

  const dataSecond = useMemo(() => {
    return [
      {
        icon: <PiCalendarCheck />,
        title: intl.formatMessage({ id: 'choose-once-a-week' }),
      },
      {
        icon: <PiUsersThree />,
        title: intl.formatMessage({ id: 'personalized-box-no-errors' }),
      },
      {
        icon: <PiClock />,
        title: intl.formatMessage({ id: 'on-time-smooth-delivery' }),
      },
    ];
  }, [intl]);

  return (
    <div className="flex flex-col w-full gap-8 md:gap-20 relative md:mb-36 mb-20 max-w-[1024px] mx-auto px-5 md:px-0">
      <div className="flex flex-col items-center md:gap-4 gap-3 text-center w-full">
        <h2 className="font-alt font-semibold font-[unbounded] text-2xl md:text-[40px] leading-tight md:whitespace-pre-line">
          {intl.formatMessage({ id: 'what-changes-with-pito' })}
        </h2>
        <span className="text-text md:text-lg md:whitespace-pre-line font-medium">
          {intl.formatMessage({
            id: 'dont-let-daily-lunch-coordination-drain-your-time-and-energy-0',
          })}
        </span>
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
            <p
              className={classNames(
                'text-[20px] md:text-4xl font-semibold',
                intl.locale === 'vi' && 'md:h-[80px]',
              )}>
              {intl.formatMessage({ id: 'before-pito' })}
            </p>
            <div className="flex flex-col gap-2 w-full">
              {dataFirst.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 border border-[#D7D7D7] rounded-2xl py-4 px-3 md:p-5">
                  <div className="size-11 text-xl shrink-0 rounded-full flex items-center justify-center bg-[#F0F4F5] text-[#A8A8A8]">
                    <CgClose />
                  </div>
                  <span className="text-base md:text-lg text-left font-normal md:font-medium flex items-center">
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
            <p
              className={classNames(
                'text-[20px] md:text-4xl font-semibold',
                intl.locale === 'vi' && 'md:h-[80px]',
              )}>
              {intl.formatMessage({ id: 'after-pito' })}
            </p>
            <div className="flex flex-col gap-2 w-full">
              {dataSecond.map((item, index) => (
                <div
                  key={index}
                  className="border rounded-2xl overflow-hidden border-[#C5D475]">
                  <div
                    className={`flex items-center gap-3 rounded-lg transition-all duration-200 py-4 px-3 md:p-5 bg-[#C5D475] hover:bg-[#eff1f2`}>
                    <div className="size-11 text-2xl flex items-center justify-center shrink-0 rounded-full text-[#96A546] bg-white">
                      {item.icon}
                    </div>
                    <span className="text-base md:text-lg text-left font-normal md:font-medium flex items-cente">
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

export default Change;
