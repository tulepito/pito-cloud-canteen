import React, { useMemo } from 'react';
import { CgClose } from 'react-icons/cg';
import {
  PiBuildingApartment,
  PiFileText,
  PiForkKnife,
  PiLaptop,
  PiUsersThree,
} from 'react-icons/pi';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import Image from 'next/image';

import differenceImage from '../../assets/admin/difference.webp';
import differenceImage1 from '../../assets/admin/difference1.webp';
import blue from '../../assets/decorations/blue2.svg';
import pink from '../../assets/decorations/pink2.svg';
import yellow from '../../assets/decorations/yellow.svg';
import GoogleCalendarModal from '../GoogleCalendarModal';

const Difference = () => {
  const intl = useIntl();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const dataFirst = useMemo(() => {
    return [
      intl.formatMessage({
        id: 'manual-order-collection-every-day-via-zalo-excel-or-messages',
      }),
      intl.formatMessage({ id: 'fixed-menus-with-limited-flexibility' }),
      intl.formatMessage({
        id: 'frequent-delays-missing-meals-and-delivery-mistakes',
      }),
      intl.formatMessage({
        id: 'no-reporting-system-scattered-invoices-hard-to-reconcile',
      }),
      intl.formatMessage({
        id: 'the-more-employees-you-have-the-harder-it-is-to-manage',
      }),
    ];
  }, [intl]);

  const dataSecond = useMemo(() => {
    return [
      {
        icon: <PiLaptop />,
        title: intl.formatMessage({
          id: 'plan-once-for-the-entire-week-through-the-system',
        }),
      },
      {
        icon: <PiForkKnife />,
        title: intl.formatMessage({
          id: 'rotating-menus-every-day-employees-choose-their-own-meals',
        }),
      },
      {
        icon: <PiUsersThree />,
        title: intl.formatMessage({
          id: 'personalized-meal-boxes-correct-name-correct-meal',
        }),
      },
      {
        icon: <PiFileText />,
        title: intl.formatMessage({
          id: 'transparent-tracking-of-costs-and-invoices-auto-generated-reports',
        }),
      },
      {
        icon: <PiBuildingApartment />,
        title: intl.formatMessage({
          id: 'scales-effortlessly-from-20-to-500-employees',
        }),
      },
    ];
  }, [intl]);

  return (
    <>
      <div className="flex flex-col w-full gap-20 relative md:mb-36 mb-20 max-w-[1024px] mx-auto px-5 md:px-0">
        <div className="flex flex-col items-center md:gap-4 gap-3 text-center w-full">
          <h2 className="font-alt font-semibold font-[unbounded] text-2xl md:text-[40px] leading-tight">
            {intl.formatMessage(
              {
                id: 'the-difference-between-pito-cloud-canteen-and-traditional-lunch-providers',
              },
              {
                logo: (
                  <span className="text-[#D680A3]">PITO Cloud Canteen</span>
                ),
              },
            )}
          </h2>
          <span className="text-text md:text-lg md:whitespace-pre-line font-medium">
            {intl.formatMessage({
              id: 'dont-let-daily-lunch-coordination-drain-your-time-and-energy',
            })}
          </span>
          <div
            className="flex justify-center items-center w-full gap-2 mt-8"
            onClick={() => setIsModalOpen(true)}>
            <p className="capitalize btn border font-[unbounded] border-gray-300 bg-black text-white py-3 px-6 font-semibold hover:opacity-90 transition-all duration-200 hover:scale-[1.01]">
              {intl.formatMessage({ id: 'schedule-a-live-demo' })}
            </p>
          </div>
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
                {intl.formatMessage({ id: 'traditional-lunch-providers' })}
              </p>
              <div className="flex flex-col gap-2 w-full">
                {dataFirst.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 border border-[#D7D7D7] rounded-2xl py-4 px-3 md:p-5">
                    <div className="size-11 text-xl shrink-0 rounded-full flex items-center justify-center bg-[#F0F4F5] text-[#A8A8A8]">
                      <CgClose />
                    </div>
                    <span className="text-base md:text-lg text-left font-normal md:font-medium md:h-[56px] flex items-center">
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
                {intl.formatMessage({ id: 'with-pito-cloud-canteen' })}
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
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex justify-center items-center bg-black/20">
          <GoogleCalendarModal
            isModalOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        </div>
      )}
    </>
  );
};

export default Difference;
