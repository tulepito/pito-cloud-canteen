import {
  PiChartLine,
  PiClock,
  PiFileText,
  PiForkKnife,
  PiStar,
} from 'react-icons/pi';
import { useIntl } from 'react-intl';

const What = () => {
  const intl = useIntl();

  return (
    <div className="flex flex-col md:gap-10 md:mb-36 mb-20 gap-5 relative max-w-[1024px] mx-auto px-5 md:px-0">
      {/* Heading */}
      <div className="flex flex-col gap-2 items-center">
        <h2 className="font-alt text-2xl font-[unbounded] font-semibold md:text-[40px] text-center md:leading-tight md:whitespace-pre-line">
          {intl.formatMessage(
            { id: 'optimal-lunch-solution-for-tech-teams' },
            {
              highlightEn: (
                <span className="text-[#D680A3]">Optimal Lunch Solution</span>
              ),
              highlightVi: (
                <span className="text-[#D680A3]">bữa trưa tối ưu</span>
              ),
            },
          )}
        </h2>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-3 gap-2 md:gap-5">
        {/* Card 1 */}
        <div className="col-span-3 md:col-span-1 flex md:flex-col gap-3 md:gap-8 justify-between border border-black/10 bg-white rounded-2xl md:rounded-3xl px-3 py-4 md:p-5">
          <div className="shrink-0 bg-[#F6AFCE]/30 text-[#D680A3] size-8 md:size-10 rounded-full flex items-center justify-center text-2xl">
            <PiClock className="text-xl md:text-2xl" />
          </div>
          <span className="text-base md:text-2xl font-medium md:font-semibold md:h-[62px] w-full">
            {intl.formatMessage({
              id: 'cut-90-of-time-spent-on-lunch-logistics',
            })}
          </span>
        </div>

        {/* Card 2 */}
        <div className="col-span-3 md:col-span-1 flex md:flex-col gap-3 md:gap-8 justify-between border border-black/10 bg-white rounded-2xl md:rounded-3xl px-3 py-4 md:p-5">
          <div className="shrink-0 bg-[#6CCFF6]/30 text-[#3598BF] size-8 md:size-10 rounded-full flex items-center justify-center text-2xl">
            <PiForkKnife className="text-xl md:text-2xl" />
          </div>
          <span className="text-base md:text-2xl font-medium md:font-semibold md:h-[62px] w-full">
            {intl.formatMessage({
              id: 'personalized-diverse-menus-for-employees',
            })}
          </span>
        </div>

        {/* Card 3 */}
        <div className="col-span-3 md:col-span-1 flex md:flex-col gap-3 md:gap-8 justify-between border border-black/10 bg-white rounded-2xl md:rounded-3xl px-3 py-4 md:p-5">
          <div className="shrink-0 bg-[#FFC811]/30 text-[#C79000] size-8 md:size-10 rounded-full flex items-center justify-center text-2xl">
            <PiChartLine className="text-xl md:text-2xl" />
          </div>
          <span className="text-base md:text-2xl font-medium md:font-semibold md:h-[62px] w-full">
            {intl.formatMessage({
              id: 'centralized-dashboard-cost-feedback',
            })}
          </span>
        </div>

        <div className="col-span-3 flex flex-col md:flex-row justify-center items-center gap-2 md:gap-5">
          <div className="col-span-1 flex md:flex-col gap-3 md:gap-8 justify-between border border-black/10 bg-white rounded-2xl md:rounded-3xl px-3 py-4 md:p-5 w-full md:w-1/2">
            <div className="shrink-0 bg-[#C5D475]/30 text-[#96A546] size-8 md:size-10 rounded-full flex items-center justify-center text-2xl">
              <PiFileText className="text-xl md:text-2xl" />
            </div>
            <span className="text-base md:text-2xl font-medium md:font-semibold md:h-[62px] w-full">
              {intl.formatMessage({
                id: 'on-time-delivery-correct-meal-correct-name',
              })}
            </span>
          </div>
          <div className="col-span-1 flex md:flex-col gap-3 md:gap-8 justify-between border border-black/10 bg-white rounded-2xl md:rounded-3xl px-3 py-4 md:p-5 w-full md:w-1/2">
            <div className="shrink-0 bg-[#F6AFCE]/30 text-[#D680A3] size-8 md:size-10 rounded-full flex items-center justify-center text-2xl">
              <PiStar className="text-xl md:text-2xl" />
            </div>
            <span className="text-base md:text-2xl font-medium md:font-semibold md:h-[62px] w-full">
              {intl.formatMessage({
                id: 'flexible-adjustments-when-team-size-increases',
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default What;
