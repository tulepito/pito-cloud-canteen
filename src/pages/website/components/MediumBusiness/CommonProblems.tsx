import { useMemo } from 'react';
import { CgClose } from 'react-icons/cg';
import { PiFileText, PiForkKnife, PiLaptop } from 'react-icons/pi';
import { useIntl } from 'react-intl';

const CommonProblems = () => {
  const intl = useIntl();

  const problemList = useMemo(
    () => [
      intl.formatMessage({
        id: 'admins-spend-hours-every-day-handling-lunch-orders-manually',
      }),
      intl.formatMessage({
        id: 'difficulty-tracking-feedback-and-generating-detailed-reports',
      }),
      intl.formatMessage({
        id: 'limited-meal-options-repetitive-menus-and-lack-of-variety',
      }),
    ],
    [intl],
  );

  const solutionList = useMemo(
    () => [
      {
        icon: <PiFileText className="text-[#96A546]" />,
        text: intl.formatMessage({
          id: 'automate-weekly-menus-segmented-by-department-or-team',
        }),
      },
      {
        icon: <PiLaptop className="text-[#96A546]" />,
        text: intl.formatMessage({
          id: 'a-centralized-dashboard-to-track-feedback-costs-and-orders-in-one-place',
        }),
      },
      {
        icon: <PiForkKnife className="text-[#96A546]" />,
        text: intl.formatMessage({
          id: 'access-to-over-50-trusted-restaurants-with-rotating-menus-every-day',
        }),
      },
    ],
    [intl],
  );

  return (
    <div className="pt-16 md:pb-16 md:px-0 flex flex-col items-center gap-7 px-5 max-w-[1024px] mx-auto">
      <h2 className="font-[unbounded] font-bold text-3xl md:w-[75%] text-center md:text-[40px] md:leading-tight">
        {intl.formatMessage({ id: 'from-admin-overload' })} <br />{' '}
        {intl.formatMessage({ id: 'to' })}{' '}
        <span className="text-[#96A546]">
          {intl.formatMessage({ id: 'seamless-lunch-operations' })}
        </span>
      </h2>

      <div className="grid md:grid-cols-2 gap-5 md:gap-10 w-full md:px-0 mt-5">
        {/* Problems */}
        <div className="flex flex-col items-center gap-4">
          <h3 className="font-semibold w-full text-left text-lg">
            {intl.formatMessage({ id: 'are-you-facing-these-challenges' })}
          </h3>
          {problemList.map((problem, index) => (
            <div
              key={index}
              className="flex items-start gap-3 border border-[#D7D7D7] rounded-2xl p-4 w-full">
              <div className="size-9 text-xl shrink-0 rounded-full flex items-center justify-center bg-[#F0F4F5] text-[#A8A8A8]">
                <CgClose />
              </div>
              <span>{problem}</span>
            </div>
          ))}
        </div>

        {/* Solutions */}
        <div className="flex flex-col items-center gap-4">
          <h3 className="font-semibold w-full text-left text-lg">
            {intl.formatMessage({ id: 'how-pito-solves-it' })}
          </h3>
          {solutionList.map((solution, index) => (
            <div
              key={index}
              className="flex items-start gap-3 bg-[#C5D475] rounded-2xl p-4 w-full">
              <div className="size-9 text-xl shrink-0 rounded-full flex items-center justify-center bg-white">
                {solution.icon}
              </div>
              <span className="text-black">{solution.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommonProblems;
