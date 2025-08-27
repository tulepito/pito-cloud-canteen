import { useEffect, useMemo, useState } from 'react';
import {
  PiBuilding,
  PiFileText,
  PiHeadphones,
  PiLaptop,
  PiUser,
} from 'react-icons/pi';
import { useIntl } from 'react-intl';
import clsx from 'clsx';
import Image from 'next/image';

import solutions1 from '../../assets/giai-phap-com-trua-van-phong-1.webp';
import solutions2 from '../../assets/giai-phap-com-trua-van-phong-2.webp';
import solutions3 from '../../assets/giai-phap-com-trua-van-phong-3.webp';
import solutions4 from '../../assets/giai-phap-com-trua-van-phong-4.webp';

const images = [solutions1, solutions2, solutions3, solutions4];

const Smart = () => {
  const intl = useIntl();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const steps = useMemo(() => {
    return [
      {
        title: intl.formatMessage({
          id: 'schedule-meals-for-the-whole-week-in-just-a-few-minutes',
        }),
        color: '#C5D475',
        textColor: '#96A546',
        icon: <PiHeadphones />,
      },
      {
        title: intl.formatMessage({
          id: 'employees-choose-their-own-meals-no-admin-micro-managing-orders',
        }),
        color: '#C4ECFB',
        textColor: '#3598BF',
        icon: <PiLaptop />,
      },
      {
        title: intl.formatMessage({
          id: 'on-time-delivery-flexible-invoicing',
        }),
        color: '#FBD7E7',
        textColor: '#D680A3',
        icon: <PiBuilding />,
      },
      {
        title: intl.formatMessage({
          id: 'transparent-cost-reports-by-team-and-department-on-a-single-dashboard',
        }),
        color: '#FFC811',
        textColor: '#C79000',
        icon: <PiFileText />,
      },
      {
        title: intl.formatMessage({
          id: 'automated-reminders-real-time-feedback-no-manual-messaging',
        }),
        color: '#C4ECFB',
        textColor: '#3598BF',
        icon: <PiUser />,
      },
    ];
  }, [intl]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col w-full gap-8 md:gap-20 relative md:mb-36 mb-20 max-w-[1024px] mx-auto px-5 md:px-0">
      <div className="flex flex-col items-center text-center md:gap-5 gap-2 w-full pt-0">
        <span className=" font-medium">
          {intl.formatMessage({
            id: 'effortless-lunch-better-experience',
          })}
        </span>
        <h2 className="font-semibold text-2xl md:text-[40px] font-[unbounded] md:leading-tight md:whitespace-pre-line">
          {intl.formatMessage(
            {
              id: 'smart-lunch-solution-for-startups',
            },
            {
              highlightVi: (
                <span className="text-[#D680A3]">bữa trưa thông minh</span>
              ),
              highlightEn: (
                <span className="text-[#D680A3]">Smart Lunch Solution</span>
              ),
            },
          )}
        </h2>
      </div>

      <div className="flex md:flex-row flex-col gap-4  w-full">
        <div className="md:w-1/2 aspect-[3976/2899] relative hidden md:flex items-center justify-center rounded-2xl overflow-hidden">
          <Image
            src={images[currentImageIndex]}
            alt="stepBg"
            fill
            className="object-contain"
          />
        </div>

        <div className="flex md:w-1/2 flex-col gap-[10px]">
          {steps.map((step, index) => (
            <div className="flex flex-col gap-4 w-full" key={index}>
              <div className="border rounded-2xl md:rounded-[30px] overflow-hidden border-[#D7D7D7]">
                <div
                  className={`flex w-full items-start gap-3 md:gap-4 transition-all duration-200 px-3 py-4 md:p-5`}>
                  <div
                    className={clsx(
                      'size-8 md:size-11 text-lg md:text-xl flex items-center justify-center shrink-0 rounded-full',
                      `text-[${step.textColor}] bg-white`,
                    )}
                    style={{
                      backgroundColor: step.color,
                    }}>
                    {step.icon}
                  </div>

                  <span className="text-base md:text-lg text-left font-medium">
                    {step.title}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Smart;
