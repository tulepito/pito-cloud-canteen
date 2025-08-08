import {
  PiChartLine,
  PiClock,
  PiFileText,
  PiForkKnife,
  PiStar,
} from 'react-icons/pi';

const What = () => {
  return (
    <div className="flex flex-col md:gap-10 md:mb-36 mb-20 gap-5 relative max-w-[1024px] mx-auto px-5 md:px-0">
      {/* Heading */}
      <div className="flex flex-col gap-2 items-center">
        <span className="font-alt text-2xl font-[unbounded] font-semibold md:text-[40px] text-center md:leading-tight md:whitespace-pre-line">
          What Your manage lunch orders{' '}
          <span className="text-[#D680A3]">Tech Team</span> Gains with PITO
        </span>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-3 gap-2 md:gap-5">
        {/* Card 1 */}
        <div className="col-span-3 md:col-span-1 flex md:flex-col gap-3 md:gap-8 justify-between border border-black/10 bg-white rounded-2xl md:rounded-3xl px-3 py-4 md:p-5">
          <div className="shrink-0 bg-[#F6AFCE]/30 text-[#D680A3] size-8 md:size-10 rounded-full flex items-center justify-center text-2xl">
            <PiClock className="text-xl md:text-2xl" />
          </div>
          <span className="text-base md:text-2xl font-medium md:font-bold md:h-[84px]">
            Save 90% of time coordinating meals
          </span>
        </div>

        {/* Card 2 */}
        <div className="col-span-3 md:col-span-1 flex md:flex-col gap-3 md:gap-8 justify-between border border-black/10 bg-white rounded-2xl md:rounded-3xl px-3 py-4 md:p-5">
          <div className="shrink-0 bg-[#6CCFF6]/30 text-[#3598BF] size-8 md:size-10 rounded-full flex items-center justify-center text-2xl">
            <PiForkKnife className="text-xl md:text-2xl" />
          </div>
          <span className="text-base md:text-2xl font-medium md:font-bold md:h-[84px]">
            Diverse menus fitting various dietary needs (vegans, allergies,
            etc.)
          </span>
        </div>

        {/* Card 3 */}
        <div className="col-span-3 md:col-span-1 flex md:flex-col gap-3 md:gap-8 justify-between border border-black/10 bg-white rounded-2xl md:rounded-3xl px-3 py-4 md:p-5">
          <div className="shrink-0 bg-[#FFC811]/30 text-[#C79000] size-8 md:size-10 rounded-full flex items-center justify-center text-2xl">
            <PiChartLine className="text-xl md:text-2xl" />
          </div>
          <span className="text-base md:text-2xl font-medium md:font-bold md:h-[84px]">
            Centralized dashboard for cost and satisfaction tracking.
          </span>
        </div>

        <div className="col-span-3 flex flex-col md:flex-row justify-center items-center gap-2 md:gap-5">
          <div className="col-span-1 flex md:flex-col gap-3 md:gap-8 justify-between border border-black/10 bg-white rounded-2xl md:rounded-3xl px-3 py-4 md:p-5 w-full md:w-1/2">
            <div className="shrink-0 bg-[#C5D475]/30 text-[#96A546] size-8 md:size-10 rounded-full flex items-center justify-center text-2xl">
              <PiFileText className="text-xl md:text-2xl" />
            </div>
            <span className="text-base md:text-2xl font-medium md:font-bold md:h-[84px]">
              SLA-driven delivery guarantees — no disruptions during work
              sprints.
            </span>
          </div>
          <div className="col-span-1 flex md:flex-col gap-3 md:gap-8 justify-between border border-black/10 bg-white rounded-2xl md:rounded-3xl px-3 py-4 md:p-5 w-full md:w-1/2">
            <div className="shrink-0 bg-[#F6AFCE]/30 text-[#D680A3] size-8 md:size-10 rounded-full flex items-center justify-center text-2xl">
              <PiStar className="text-xl md:text-2xl" />
            </div>
            <span className="text-base md:text-2xl font-medium md:font-bold md:h-[84px]">
              Flexibility for last-minute changes in team size or schedules.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default What;
