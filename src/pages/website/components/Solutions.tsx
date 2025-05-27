import { useIntl } from 'react-intl';
import Image from 'next/image';

import lemon from '../assets/decorations/lemon.svg';
import yellow from '../assets/decorations/yellow.svg';
import solutions from '../assets/solutions.png';

const Solutions = () => {
  const intl = useIntl();

  const solutionData = [
    {
      title: intl.formatMessage({ id: 'for-companies-under-100-employees' }),
      highlight: 'Under',
      color: '#C5D475',
      borderColor: 'border-[#C5D475]',
      points: [
        intl.formatMessage({
          id: 'meals-are-delivered-and-neatly-set-up-in-the-office-pantry',
        }),
        intl.formatMessage({
          id: 'restaurants-rotate-daily-for-added-variety',
        }),
        intl.formatMessage({
          id: 'employees-can-choose-meals-based-on-their-preferences',
        }),
        intl.formatMessage({
          id: 'optional-autopilot-mode-for-automatic-meal-planning-0',
        }),
      ],
    },
    {
      title: intl.formatMessage({ id: 'for-companies-over-100-employees' }),
      highlight: 'Over',
      color: '#FFC811',
      borderColor: 'border-[#FFC811]',
      points: [
        intl.formatMessage({
          id: 'on-site-pop-up-canteen-setup-at-your-office',
        }),
        intl.formatMessage({
          id: 'weekly-or-monthly-vendor-rotation-for-meal-variety',
        }),
        intl.formatMessage({
          id: 'clear-budget-management-tools-for-admins-and-accountants',
        }),
        intl.formatMessage({
          id: 'full-setup-and-on-site-support-by-the-pito-team',
        }),
      ],
    },
  ];

  return (
    <div className="md:py-20 md:px-4 md:pb-36 p-5 flex gap-10 relative max-w-[1024px] mx-auto">
      <div className="md:w-1/2 flex flex-col md:items-start items-center">
        <span>{intl.formatMessage({ id: 'solutions' })}</span>
        <span className="font-alt font-bold text-2xl md:text-4xl md:w-auto w-2/3 md:text-start text-center">
          {intl.formatMessage({ id: 'solutions-for-every-team-size' })}
        </span>
        <div className="flex flex-col gap-5 w-full mt-5 relative">
          {solutionData.map((item, idx) => {
            const highlightText = item.title.replace(
              item.highlight,
              `<span style="color:${item.color}">${item.highlight}</span>`,
            );

            return (
              <div
                key={idx}
                className={`bg-white border ${item.borderColor} rounded-3xl flex flex-col gap-3 p-5`}>
                <span
                  className="font-semibold text-lg"
                  dangerouslySetInnerHTML={{ __html: highlightText }}
                />
                <div className="flex flex-col gap-2 text-sm">
                  {item.points.map((point, index) => (
                    <div key={index} className="flex gap-2">
                      <div
                        className="size-3.5 mt-1 shrink-0 rounded-sm"
                        style={{ backgroundColor: item.color }}></div>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {/* decorations */}
          <Image
            src={yellow}
            alt="yellow circle decor"
            className="absolute -z-10 size-20 bottom-16 -left-14"
          />
          <Image
            src={lemon}
            alt="lemon triangle decor"
            className="absolute -right-14 -top-10 -rotate-45 size-52 -z-10"
          />
        </div>
      </div>
      <div className="flex-1 relative md:flex hidden scale-[175%] top-44 left-10">
        <Image
          src={solutions}
          alt="solutions hero"
          className="absolute -rotate-12 -right-20 w-[60rem]"
        />
      </div>
    </div>
  );
};

export default Solutions;
